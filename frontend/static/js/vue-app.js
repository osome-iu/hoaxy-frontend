var max_articles = 20;

var TWEET_URL = "https://twitter.com/%0/status/%1";

var colors = {
    node_colors : {
        "fact_checking" : 'darkblue',
        "claim" : 'darkblue'
    },
    edge_colors : {
        "fact_checking" : 'green',
        "fact_checking_dark" : 'green',
        "claim" : 'orange',
        "claim_dark" : 'orange'
    }
};

var app = new Vue({
    el: '#vue-app',
    data: {

        loading: true,
        mounted: false,
        show_articles: false,
        show_graphs: false,
        show_zoom_buttons: false,
        articles: [],
        articles_to_show: max_articles,
        input_disabled: false,
        spin_counter: 0,
        spinner_state: 1,
        spinner_rotate: 0,
        spin_timer: null,

        query_text: "",
        query_sort: "relevant",
        query_include_mentions: true,

        checked_articles: [],


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
            is_retweeted_by_count: 0
        },

        colors: colors
    },
    methods: {

        getSubsetOfArticles: function(){
            return this.articles.slice(0, this.articles_to_show);
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
        getDateline: function(url_pub_date)
        {
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
        scrollToElement: function(id)
        {
            window.scroll(0,this.getOffset(id).top);
        },
        changeURLParams: function(){
            var query_string = "query=" + encodeURIComponent(this.query_text) + "&sort=" + this.query_sort;
        	location.hash = query_string;
        	return query_string;
        },
        spinStop: function(reset){
        	this.spin_counter --;
        	if(reset === true)
        	{
        		this.spin_counter = 0;
        	}

        	if(this.spin_counter <= 0)
        	{
        		// spinner = undefined;
        		this.loading = false;
        		clearTimeout(this.spin_timer);
        		this.spin_timer = null;
        	}

        },
        spinStart: function(){
        	this.spin_counter = 2;
        	this.loading = true;
        	// var target = document.getElementById('spinner');
        	// spinner = new Spinner(opts).spin(target);
        	//timeout after 90 seconds so we're not stuck in an endless spinning loop.
        	if(this.spin_timer)
        	{
        		clearTimeout(this.spin_timer);
        		this.spin_timer = null;
        	}
            var v = this;
        	this.spin_timer = setTimeout(function(){
        		alert("The app is taking too long to respond.  Please try again later.");
        		v.spinStop(true);
        		// v.enableInput();
                this.input_disabled = false;
        	}, 90000);
        },


        submitForm: function(dontScroll){
            // this.disableInput();
            this.input_disabled = true;
            this.spinStart();

            this.show_articles = false;
            $("#select_all").prop("checked", false);
            if(!this.query_text)
            {
                alert("You must input a claim.");
                this.spinStop();
                this.spinStop();
                this.spinStop();
                // this.enableInput();
                this.input_disabled = false;
                return false;
            }

            this.changeURLParams();

            var urls_request = $.ajax({
                url: configuration.articles_url,
                headers: configuration.articles_headers,
                data: {
                    "query": this.query_text,
                    "sort_by" : this.query_sort
                },
                dataType: "json",
            });

            var v = this;
            urls_request.done(function (msg) {
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
                var visualize_top = $("#visualize_top");
                var visualize_bottom = $("#visualize");

                if(!dontScroll)
                {
                    v.scrollToElement("articles");
                }
                else
                {
                    dontScroll = false;
                }
            });
            urls_request.fail(function (jqXHR, textStatus) {
                alert("Get URLs Request failed: " + textStatus);
                console.log('ERROR', textStatus);
            });
            urls_request.complete(function(){
                v.spinStop(true);
                // v.enableInput();
                v.input_disabled = false;
            });

        },

        visualizeSelectedArticles: function(){
            this.spinStart();
            this.show_graphs = false;

            //kill sigma if it's currently a thing
            if(s)
            {
                s.kill();
                s = null;
                console.debug("Killed Existing Sigma");
            }

            if(this.checked_articles.length > 20)
            {
                alert("You can visualize a maximum of 20 articles.");
                event.preventDefault();
                event.stopPropagation();
                this.spinStop(true);
                return false;
            }

            if(this.checked_articles.length <= 0)
            {
                alert("Select at least one article to visualize.");
                this.spinStop();
                this.spinStop();
                this.spinStop();
                this.input_disabled = false;
                return false;
            }

            var v = this;

            //Timeline
            var timeline_request = $.ajax({
                url: configuration.timeline_url,
                headers: configuration.timeline_headers,
                data: {
                    "resolution": "D",
                    "ids" : "[" + this.checked_articles.toString() + "]"
                },
                dataType: "json",
            });
            timeline_request.done(function (msg) {
                v.show_graphs = true;
                retrieveTimeSeriesData(msg.timeline);
                window.scroll(0,v.getOffset("graphs").top);
            });
            timeline_request.fail(function (jqXHR, textStatus) {
                alert("Get TimeLine Request failed: " + textStatus);
            });
            timeline_request.complete(function(){
                v.spinStop();
            })

            //Network
            var graph_request = $.ajax({
                //type: "GET",
                url: configuration.network_url,
                headers: configuration.network_headers,
                data: {
                    "include_user_mentions" : "true",
                    "ids" : "[" + this.checked_articles.toString() + "]",
                },
                dataType: "json",
            });
            graph_request.done(function (msg){
                edges = msg.edges.map(function(x){
                    y = x;
                    y.site_domain = x.domain;
                    y.pub_date = x.publish_date;
                    y.url_raw = x.canonical_url;
                    return y;
                });
            });
            graph_request.fail(function (jqXHR, textStatus) {
                alert("Get Graph Request failed: " + textStatus);
                v.spinStop();
            });
            graph_request.complete(function(){
                v.input_disabled = false;
            })
        }
    },
    watch: {
    },
    mounted: function(){
        this.mounted = true;
        this.spinStop(true);
        this.show_articles = false;
        this.show_graphs = false;

        var v = this;
        var f = function(){
            var counter = 0;
            setInterval(function(){
                // console.debug("out", counter);
                if(v.loading){
                    // console.debug("in", counter);
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
        var params = location.hash.replace("#", "").split("&");
        for( var i in params)
        {
            var param = params[i].split("=");
            var key = param[0];
            var value = param[1];
            if(key == "query")
            {
                this.query_text = value;
            }
            if(key == "sort")
            {
                this.query_sort = value;
            }
        }

        if(this.query_text)
        {
            this.submitForm(true);
        }


        console.debug("Vue Mounted.");
    }
});
