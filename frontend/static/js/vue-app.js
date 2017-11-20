var max_articles = 20;

var TWEET_URL = "https://twitter.com/%0/status/%1";
var debug = true;
var colors = {
    node_colors : {
        "fact_checking" : 'darkblue',
        "claim" : 'darkblue',
        "botscores": [
            {red: 255, green: 0, blue: 0} ,
			{red: 245, green: 90, blue: 150} ,
			{red: 255, green: 128, blue: 200} ,
			{red: 170, green: 90, blue: 220} ,
			{red: 0, green: 0, blue: 255}
            // {red: 215, green: 25, blue: 28},
            //
            // {red: 181, green: 56, blue: 80},
            // // {red: 164, green: 38, blue: 85},
            // // {red: 60, green: 65, blue:196},
            // {red: 57, green: 106, blue:211},
            // {red: 91, green: 148, blue:219},
            //
            // {red: 138, green: 206, blue: 229} ,


            // {red: 215, green: 25, blue: 28} ,
            // {red: 223, green: 111, blue: 161},
            // {red: 147, green: 112, blue:219},
            // {red: 44, green: 123, blue:182},
            // {red: 138, green: 206, blue: 229} ,


			// {red: 253, green: 174, blue: 97} ,
			// {red: 255, green: 127, blue: 0} ,
            // {red: 181, green: 126, blue:220},
			// {red: 255, green: 210, blue: 2} ,
            // {red: 138, green: 206, blue:229},
            // {red: 227, green: 11, blue:92},
            // {red: 215, green: 25, blue:28},
		]
    },
    edge_colors : {
        "fact_checking" : 'rgb(238,210,2)',
        "fact_checking_dark" : 'rgb(169, 171, 2)',
        "claim" : 'darkgray',
        "claim_dark" : 'gray'
    }
};

// var colors = {
//     node_colors : {
//         "fact_checking" : '#1f2041',
//         "claim" : '#1f2041'
//     },
//     edge_colors : {
//         "fact_checking" : '#F46036',
//         "fact_checking_dark" : '#cc4f2d',
//         "claim" : '#4B3F72',
//         "claim_dark" : '#2a2340'
//     }
// };

var app = new Vue({
    el: '#vue-app',
    data: {

        //  ######
        //  #     #   ##   #####   ##
        //  #     #  #  #    #    #  #
        //  #     # #    #   #   #    #
        //  #     # ######   #   ######
        //  #     # #    #   #   #    #
        //  ######  #    #   #   #    #

        loading: true,
        mounted: false,
        show_articles: false,
        show_graphs: false,
        show_zoom_buttons: false,
        graph_column_size: 3,


        articles: [],
        articles_to_show: max_articles,
        input_disabled: false,
        spin_key_table: ["initialLoad"], //each set of spin start/stops should have the same key
        spinner_state: 1,
        spinner_rotate: 0,
        spin_timer: 0,
        spinner_notices: {
            graph: "",
            timeline: "",
            articles: ""
        },

        query_text: "",
        query_sort: "relevant",
        query_include_mentions: true,

        checked_articles: [],


        twitter_account_info: {},
        twitter: {},

        timeline: null,
        graph: null,
        getting_bot_scores: {running: false},

        show_error_modal: false,
        error_message: "",
        show_edge_modal: false,
        show_node_modal: false,
        modal_opacity: false,
        edge_modal_content: {
            edge: {},
            tweet_urls: {},
            label_string: ""
        },
        node_modal_content: {
            user_id: "",
            screenname: "",
            has_quoted: [],
            has_mentioned: [],
            has_retweeted: [],
            is_quoted_by: [],
            is_mentioned_by: [],
            is_retweeted_by: [],
            has_quoted_count: 0,
            has_mentioned_count: 0,
            has_retweeted_count: 0,
            is_quoted_by_count: 0,
            is_mentioned_by_count: 0,
            is_retweeted_by_count: 0,
            botscore: 0,
            botcolor: 0
        },
        failed_to_get_network: false,


        feedback_form: {
            display: false,
            comment: "",
            type: "",
            type_choices: {
                "Human":"human",
                "Bot":"bot",
                "Cyborg (human using e.g. a scheduler)":"cyborg",
                "Organization":"organization"
            }
        },

        colors: colors
    },
    computed: {
        animationPlaying: function(){
            if(!this.graph)
            {
                return false;
            }
            return this.graph.playing();
        }
    },

    // #     #
    // ##   ## ###### ##### #    #  ####  #####   ####
    // # # # # #        #   #    # #    # #    # #
    // #  #  # #####    #   ###### #    # #    #  ####
    // #     # #        #   #    # #    # #    #      #
    // #     # #        #   #    # #    # #    # #    #
    // #     # ######   #   #    #  ####  #####   ####

    methods: {
        formatTime: function(time){
            return moment(time).format("MMM D YYYY h:mm a");
        },
        getSubsetOfArticles: function(){
            return this.articles.slice(0, this.articles_to_show);
        },
        getDateline: function(url_pub_date){
            var pub_date = moment(url_pub_date);
            var dateline = pub_date.format('MMM D, YYYY');
            return dateline;
        },
        getOffset: function(element){
            if(!element)
            {
                throw "No element defined in getOffset";
            }
            else if(typeof element == "string")
            {
                element = document.getElementById(element);
            }
            var x = element.offsetLeft;
            var y = element.offsetTop;

            while (element = element.offsetParent) {
                x += element.offsetLeft;
                y += element.offsetTop;
            }

            return { left: x, top: y };
        },
        scrollToElement: function(id){
            if(document.getElementById(id))
            {
                window.scroll(0,this.getOffset(id).top);
            }
        },
        changeURLParams: function(){
            var query_string = "query=" + encodeURIComponent(this.query_text) + "&sort=" + this.query_sort;
            location.hash = query_string;
            return query_string;
        },
        spinStop: function(key, reset){
            // console.debug(key);
            var key_index = this.spin_key_table.indexOf(key);
            if(key_index >= 0)
            {
                this.spin_key_table.splice(key_index, 1);
            }
            if(this.spin_key_table.length == 0)
            {
                this.loading = false;
                this.input_disabled = false;
                clearTimeout(this.spin_timer);
            }
            // console.debug(key, this.spin_key_table);
        },
        spinStart: function(key){
            // console.debug(key);
            this.spin_key_table.push(key);
            this.loading = true;
            this.input_disabled = true;
            //timeout after 90 seconds so we're not stuck in an endless spinning loop.
            var v = this;
            clearTimeout(this.spin_timer);
            this.spin_timer = setTimeout(function(){
                v.displayError("The app is taking too long to respond.  Please try again later.");
                console.debug(v.spin_key_table);
                v.spin_key_table.length = 0;
                v.spinStop();

            }, 90000);
        },

        //   ##        #   ##   #    #    ###### #    # #    #  ####  ##### #  ####  #    #  ####
        //  #  #       #  #  #   #  #     #      #    # ##   # #    #   #   # #    # ##   # #
        // #    #      # #    #   ##      #####  #    # # #  # #        #   # #    # # #  #  ####
        // ######      # ######   ##      #      #    # #  # # #        #   # #    # #  # #      #
        // #    # #    # #    #  #  #     #      #    # #   ## #    #   #   # #    # #   ## #    #
        // #    #  ####  #    # #    #    #       ####  #    #  ####    #   #  ####  #    #  ####

        getArticles: function(dontScroll){
            this.spinStart("getArticles");
            this.spinner_notices.articles = "Fetching articles...";

            var urls_request = axios.get(configuration.articles_url, {
                headers: configuration.articles_headers,
                params: {
                    "query": this.query_text,
                    "sort_by" : this.query_sort
                },
                responseType: "json",
            });
            var v = this;
            urls_request.then(
                function (response) {
                    v.spinner_notices.articles = "";
                    var msg = response.data
                    var urls_model = msg;
                    if(!msg.articles || !msg.articles.length)
                    {
                        v.displayError("Your query did not return any results.");
                        v.spinStop("getArticles");
                        return false;
                    }
                    urls_model.urls = msg.articles.map(function(x){
                        y = x;
                        y.site_domain = x.domain;
                        y.url_id = x.id;
                        y.pub_date = x.publish_date;
                        y.url_raw = x.canonical_url;
                        return y;
                    });
                    v.articles = urls_model.urls;
                    v.articles_to_show = max_articles;
                    v.show_articles = true;
                    if(!dontScroll)
                    {
                        v.scrollToElement("articles");
                    }

                    if(debug)
                    {
                        v.checked_articles.push(v.articles[0].url_id);
                        v.getTimeline(v.checked_articles);
                        v.getNetwork(v.checked_articles);
                    }

                    v.spinStop("getArticles");
                },
                function (error) {
                    v.spinner_notices.articles = "";
                    v.displayError("Get URLs Request failed: " + error);
                    console.log('Articles Request Error:', error);
                    v.spinStop("getArticles");
                }
            );
            // urls_request.complete(function(){ v.spinStop("getArticles"); });
            return urls_request;
        },



        getTimeline: function(article_ids){
            this.spinStart("getTimeline");
            this.spinner_notices.timeline = "Fetching timeline...";
            var timeline_request = axios.get( configuration.timeline_url, {
                headers: configuration.timeline_headers,
                params: {
                    "resolution": "D",
                    "ids" : "[" + article_ids.toString() + "]"
                },
                responseType: "json",
            });
            var v = this;
            timeline_request.then(
                function (response) {
                    v.spinner_notices.timeline = "";
                    var msg = response.data;
                    v.spinStart("updateTimeline");
                    v.show_graphs = true;
                    //update the timeline on the next tick because at this point
                    // the graphs are still hidden. Graphs will be visible on the
                    // next tick
                    Vue.nextTick(function(){
                        v.timeline.update(msg.timeline);
                        v.spinStop("updateTimeline");
                        v.scrollToElement("graphs");
                        v.timeline.redraw();
                    });
                    v.spinStop("getTimeline");
                },
                function (error) {
                    v.spinner_notices.timeline = "";
                    v.displayError("Get TimeLine Request failed: " + error);
                    console.log('Timeline Request Error', error);

                    // v.updateGraph();
                    v.spinStop("getTimeline");
                }
            );
            return timeline_request;
        },
        getNetwork: function(article_ids){
            this.spinStart("getNetwork");
            this.spinner_notices.graph = "Fetching graph...";

            this.timeline.removeUpdateDateRangeCallback();
            this.failed_to_get_network = false;
            var graph_request = axios.get( configuration.network_url, {
                headers: configuration.network_headers,
                params: {
                    "include_user_mentions" : "true",
                    "ids" : "[" + article_ids.toString() + "]",
                },
                responseType: "json",
            });
            var v = this;
            graph_request.then(
                function (response){
                    v.spinStop("getNetwork");
                    v.spinner_notices.graph = "Drawing Graph...";

                    var msg = response.data;
                    var edge_list;
                    if(msg.error)
                    {
                        v.show_zoom_buttons = false;
                        v.failed_to_get_network = true;
                        edge_list = []
                        v.spinner_notices.graph = "";
                    }
                    else
                    {
                        v.spinStart("generateNetwork");
                        //create an edge list

                    }

                    v.show_graphs = true;
                    Vue.nextTick(function(){
                        edge_list = msg.edges.map(function(x){
                            y = x;
                            y.site_domain = x.domain;
                            y.pub_date = x.publish_date;
                            y.url_raw = x.canonical_url;
                            return y;
                        });
                        v.graph.updateEdges(edge_list);
                        v.updateGraph();
                        // v.timeline.redraw();

                        v.scrollToElement("graphs");
                    });


                    //after the botcache request is complete,
                    // update the graph even if the request fails
                    // if it fails, it just won't have the bot scores
                    // v.timeline.updateDateRange();

                },
                function (error) {
                    v.displayError("Get Graph Request failed: " + error.response.statusText);
                    console.log('Network Graph Request Error', error.response.statusText);
                    v.spinStop("getNetwork");
                    v.spinner_notices.graph = "";
                }
            );
            return graph_request;
        },



        //    #                                              # ######                                       #####
        //   # #    ####  ##### #  ####  #    #  ####       #  #     # #    # ##### #####  ####  #    #    #     # #      #  ####  #    #  ####
        //  #   #  #    #   #   # #    # ##   # #          #   #     # #    #   #     #   #    # ##   #    #       #      # #    # #   #  #
        // #     # #        #   # #    # # #  #  ####     #    ######  #    #   #     #   #    # # #  #    #       #      # #      ####    ####
        // ####### #        #   # #    # #  # #      #   #     #     # #    #   #     #   #    # #  # #    #       #      # #      #  #        #
        // #     # #    #   #   # #    # #   ## #    #  #      #     # #    #   #     #   #    # #   ##    #     # #      # #    # #   #  #    #
        // #     #  ####    #   #  ####  #    #  ####  #       ######   ####    #     #    ####  #    #     #####  ###### #  ####  #    #  ####

        submitFeedbackForm: function(){
            this.feedback_form.display = false;
            var v = this;
            if(!v.twitter_account_info.id)
            {
                v.twitterLogIn()
                .then(function(){
                    v.sendFeedbackData();
                });
            }
            else
            {
                v.sendFeedbackData();
            }


        },
        sendFeedbackData: function()
        {
            var feedback = {
                source_user_id: this.twitter_account_info.id,
                target_user_id: this.graph.botscores()[this.node_modal_content.screenName].user_id,
                target_screen_name: this.node_modal_content.screenName,
                feedback_label: this.feedback_form.type,
                feedback_text: this.feedback_form.comment,
                target_profile: null,
                target_timeline_tweets: null,
                target_mention_tweets: null,
                time_stamp: new Date(),

                botscore_computed_time: this.node_modal_content.timestamp,
                reported_botscore: this.node_modal_content.botscore,
                source_screen_name: this.twitter_account_info.screen_name,
            };

            var prom = axios({
                method: "POST",
                url: configuration.feedback_url,
                data: feedback
            })
            .then(function(response){
                console.debug(response.data);
            }, function(error){
                console.debug(error);
            });

            this.feedback_form.type = "";
            this.feedback_form.comment = "";
            console.debug(feedback);
        },
        resizeGraphs: function(x){
            this.graph_column_size = x;
            var v = this;
            Vue.nextTick(function(){
                v.timeline.redraw();
                v.graph.redraw();
            });
            // console.debug(this.graph_column_size);
        },

        shrinkGraph: function(){
            this.graph_column_size += 3;
            this.resizeGraphs();
        },
        shrinkTimeline: function(){
            this.graph_column_size -= 3;
            this.resizeGraphs();

        },
        filterGraph: function(){
            var tstamp = (new Date(2017, 5, 15)).getTime();
            this.graph.filter(tstamp);
        },
        startGraphAnimation: function(){
            this.graph.startFilterAnimation();
        },

        twitterLogIn: function(){
            var me = this.twitter.verifyMe();
            var v = this;
            me.then(
                function(response){
                    v.twitter_account_info = response;
                },
                function(error){
                    v.twitter_account_info = {};
                    console.debug("error: ", error);
                    // this.getting_bot_scores.running = false;
                }
            );
            return me;
        },
        getMoreBotScores: function(){
            // this.getting_bot_scores = true;
            if(!this.twitter_account_info.id)
            {
                var prom = this.twitterLogIn();
                prom.then( this.graph.getNewScores );

            }
            else
            {
                this.graph.getNewScores();
            }
        },
        getSingleBotScore: function(screen_name){
            var v = this;
            this.getting_bot_scores.running = true;
            var success = new Promise(function(resolve, reject){
                if(!v.twitter_account_info.id)
                {
                    v.twitterLogIn()
                    .then(function(){
                        v.graph.updateUserBotScore({screen_name: screen_name})
                        .then(resolve, reject);

                    })
                }
                else
                {
                    v.graph.updateUserBotScore({screen_name: screen_name})
                    .then(resolve, reject)
                }
            });
            success.then(function(response){
                // console.debug(response);
                v.getting_bot_scores.running = false;

                try {
                    var score = response.data.scores.english;
                    v.node_modal_content.botscore = Math.floor(score * 100);
                    v.node_modal_content.botcolor = v.graph.getNodeColor(score);
                    v.node_modal_content.timestamp = new Date();
                }
                catch (e)
                {
                    console.warn(e);
                    v.node_modal_content.botscore = -1;
                    v.node_modal_content.botcolor = v.graph.getNodeColor(-1);
                }
            }, function(){
                v.getting_bot_scores.running = false;
                v.node_modal_content.botscore = -1;
                v.node_modal_content.botcolor = v.graph.getNodeColor(-1);
            })

        },
        twitterLogOut: function(){
            var p = this.twitter.logOut();
            this.twitter_account_info = {};
        },

        submitForm: function(dontScroll){
            this.show_articles = false;
            this.show_graphs = false;
            this.checked_articles = [];
            // $("#select_all").prop("checked", false);
            if(!this.query_text)
            {
                this.displayError("You must input a claim.");
                this.spinStop(true);
                return false;
            }
            this.changeURLParams();
            this.getArticles(dontScroll);
            this.spinStop();
        },
        visualizeSelectedArticles: function(){
            this.show_graphs = false;
            if(this.checked_articles.length > 20)
            {
                this.displayError("You can visualize a maximum of 20 articles.");
                this.spinStop(true);
                return false;
            }
            if(this.checked_articles.length <= 0)
            {
                this.displayError("Select at least one article to visualize.");
                this.spinStop(true);
                return false;
            }
            this.graph.updateEdges([]);
            this.getTimeline(this.checked_articles);
            this.getNetwork(this.checked_articles);
            this.spinStop();
        },
        toggleEdgeModal: function(force){
            this.toggleModal("edge", force);
        },
        toggleNodeModal: function(force){
            this.toggleModal("node", force);
            this.feedback_form.display = false;
        },
        displayError: function(message){
            this.error_message = message;
            this.toggleModal('error', true);
        },
        toggleErrorModal: function(force){
            this.toggleModal('error', force);
        },
        toggleModal: function(modal, force)
        {
            this.graph.redraw();
            //the timeouts here help with the animation and will need to be adjusted as required
            var prop = "show_" + modal + "_modal";
            var v = this;
            if(!this[prop] || force === true) //show
            {
                this[prop] = true;
                document.getElementsByTagName("body")[0].style.overflowY = "hidden";
                setTimeout(function(){
                    v.modal_opacity = true;
                },1);
            }
            else //hide
            {
                this.modal_opacity = false;
                document.getElementsByTagName("body")[0].style.overflowY = "";
                setTimeout(function(){
                    v[prop] = false;
                },100);
            }
        },
        loadMore: function(){
            if(this.articles_to_show < this.articles.length)
            {
                this.articles_to_show += max_articles;
            }
            else
            {
                this.articles_to_show = max_articles;
            }
        },
        zoomInGraph: function(){
            this.graph.zoomIn();
        },
        zoomOutGraph: function(){
            this.graph.zoomOut();
        },
        updateGraph: function(starting_time, ending_time){
            this.graph_column_size = 3;
            if(this.failed_to_get_network)
                return false;

            this.graph.updateGraph(starting_time, ending_time);
            this.show_zoom_buttons = true;
            this.scrollToElement("graphs");
        }
    },
    watch: {
        // "twitter.me": function(){
        //     console.info("twitter");
        //     this.twitter_authorized = !!this.twitter.me();
        //     console.debug(this.twitter.me());
        //     console.debug(this.twitter_authorized);
        // }
    },

    //  #     #
    //  ##   ##  ####  #    # #    # ##### ###### #####
    //  # # # # #    # #    # ##   #   #   #      #    #
    //  #  #  # #    # #    # # #  #   #   #####  #    #
    //  #     # #    # #    # #  # #   #   #      #    #
    //  #     # #    # #    # #   ##   #   #      #    #
    //  #     #  ####   ####  #    #   #   ###### #####

    mounted: function(){
        this.mounted = true;
        this.show_articles = false;
        this.show_graphs = false;

        //create hourglass loading spinner
        var v = this;
        var f = function(){
            var counter = 0;
            setInterval(function(){
                if(v.loading){
                    counter ++;
                    if(counter < 4)
                    v.spinner_rotate = (v.spinner_state = counter)*0;
                    else if (counter <= 12)
                    v.spinner_rotate = (counter - 4) * 22.5;
                    else
                    counter = 0;
                }
            }, 100);
        }();


        //If there's a hash querystring, populate the form with that data by default
        var params = location.hash.replace("#", "").split("&");
        for( var i in params)
        {
            var param = params[i].split("=");
            var key = param[0];
            var value = param[1];
            if(key == "query")
            {
                this.query_text = decodeURIComponent(value);
            }
            if(key == "sort")
            {
                this.query_sort = value;
            }
        }

        //if we prepopulated the form with query string data, submit the form right away
        if(this.query_text)
        {
            this.submitForm(true);
        }


        this.twitter = new Twitter(configuration.twitter_key);
        this.me = this.twitter.me();


        //callbacks allow for modal manipulation and loading spinner to be handled
        //  by vue.
        this.graph = new HoaxyGraph({
            spinStart: this.spinStart,
            spinStop: this.spinStop,
            toggle_edge_modal: this.toggleEdgeModal,
            toggle_node_modal: this.toggleNodeModal,
            node_modal_content: this.node_modal_content,
            edge_modal_content: this.edge_modal_content,
            getting_bot_scores: this.getting_bot_scores,
            spinner_notices: this.spinner_notices,
            // twitter_account_info: this.twitter_account_info,
            twitter: this.twitter
        });

        //create the chart that is used to visualize the timeline
        // the updateGraph function is a callback when the timeline interval is adjusted
        this.timeline = new HoaxyTimeline(this.updateGraph);

        // this.displayError("Test Error");

        this.spinStop("initialLoad");
        console.debug("Vue Mounted.");
    }
});
