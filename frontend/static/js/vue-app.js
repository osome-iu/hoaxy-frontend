var max_articles = 20;

var TWEET_URL = "https://twitter.com/%0/status/%1";

var colors = {
    node_colors : {
        "fact_checking" : 'darkblue',
        "claim" : 'darkblue',
        "botscores": [
			{red: 215, green: 25, blue: 28} ,
			{red: 253, green: 174, blue: 97} ,
			{red: 255, green: 255, blue: 151} ,
			{red: 138, green: 206, blue: 229} ,
			{red: 44, green: 123, blue: 182},
		]
    },
    edge_colors : {
        "fact_checking" : 'green',
        "fact_checking_dark" : 'green',
        "claim" : 'orange',
        "claim_dark" : 'orange'
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
        articles: [],
        articles_to_show: max_articles,
        input_disabled: false,
        spin_key_table: ["initialLoad"], //each set of spin start/stops should have the same key
        spinner_state: 1,
        spinner_rotate: 0,
        spin_timer: 0,

        query_text: "",
        query_sort: "relevant",
        query_include_mentions: true,

        checked_articles: [],


        twitter_account_info: {},
        twitter: {},

        timeline: null,
        graph: null,
        getting_bot_scores: {running: false},

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

        colors: colors
    },
    computed: {
    },

    // #     #
    // ##   ## ###### ##### #    #  ####  #####   ####
    // # # # # #        #   #    # #    # #    # #
    // #  #  # #####    #   ###### #    # #    #  ####
    // #     # #        #   #    # #    # #    #      #
    // #     # #        #   #    # #    # #    # #    #
    // #     # ######   #   #    #  ####  #####   ####

    methods: {

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
                alert("The app is taking too long to respond.  Please try again later.");
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
                    var msg = response.data
                    var urls_model = msg;
                    if(!msg.articles || !msg.articles.length)
                    {
                        alert("Your query did not return any results.");
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

                    v.spinStop("getArticles");
                },
                function (error) {
                    alert("Get URLs Request failed: " + error.response.statusText);
                    console.log('Articles Request Error:', error.response.statusText);
                    v.spinStop("getArticles");
                }
            );
            // urls_request.complete(function(){ v.spinStop("getArticles"); });
            return urls_request;
        },



        getTimeline: function(article_ids){
            this.spinStart("getTimeline");
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
                    });
                    v.spinStop("getTimeline");
                },
                function (error) {
                    alert("Get TimeLine Request failed: " + error.response.statusText);
                    console.log('Timeline Request Error', error.response.statusText);
                    v.spinStop("getTimeline");
                }
            );
            return timeline_request;
        },
        getNetwork: function(article_ids){
            this.spinStart("getNetwork");
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

                    var msg = response.data;
                    var edge_list;
                    if(msg.error)
                    {
                        v.show_zoom_buttons = false;
                        v.failed_to_get_network = true;
                        edge_list = []
                    }
                    else
                    {
                        v.spinStart("generateNetwork");
                        //create an edge list
                        edge_list = msg.edges.map(function(x){
                            y = x;
                            y.site_domain = x.domain;
                            y.pub_date = x.publish_date;
                            y.url_raw = x.canonical_url;
                            return y;
                        });
                    }

                    //after the botcache request is complete,
                    // update the graph even if the request fails
                    // if it fails, it just won't have the bot scores
                    v.graph.updateEdges(edge_list);
                    // v.timeline.updateDateRange();

                },
                function (error) {
                    alert("Get Graph Request failed: " + error.response.statusText);
                    console.log('Network Graph Request Error', error.response.statusText);
                    v.spinStop("getNetwork");
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
                // console.debug(response.data.scores.english);
                v.getting_bot_scores.running = false;
                try {
                    var score = response.data.scores.english;
                    v.node_modal_content.botscore = Math.floor(score * 100);
                    v.node_modal_content.botcolor = v.graph.getNodeColor(score);
                }
                catch (e)
                {
                    console.error(e);
                }
            }, function(){
                v.getting_bot_scores.running = false;
            })

        },
        twitterLogOut: function(){
            var p = this.twitter.logOut();
            this.twitter_account_info = {};
        },

        submitForm: function(dontScroll){
            this.show_articles = false;
            // $("#select_all").prop("checked", false);
            if(!this.query_text)
            {
                alert("You must input a claim.");
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
                alert("You can visualize a maximum of 20 articles.");
                this.spinStop(true);
                return false;
            }
            if(this.checked_articles.length <= 0)
            {
                alert("Select at least one article to visualize.");
                this.spinStop(true);
                return false;
            }

            this.getTimeline(this.checked_articles);
            this.getNetwork(this.checked_articles);
            this.spinStop();
        },
        toggleEdgeModal: function(force){
            this.toggleModal("edge", force);
        },
        toggleNodeModal: function(force){
            this.toggleModal("node", force);
        },
        toggleModal: function(modal, force)
        {
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
            // twitter_account_info: this.twitter_account_info,
            twitter: this.twitter
        });

        //create the chart that is used to visualize the timeline
        // the updateGraph function is a callback when the timeline interval is adjusted
        this.timeline = new HoaxyTimeline(this.updateGraph);



        this.spinStop("initialLoad");
        console.debug("Vue Mounted.");
    }
});
