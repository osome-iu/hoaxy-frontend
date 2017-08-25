var max_articles = 20;

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
        spin_timer: null,

        query_text: "",
        query_sort: "relevant",
        query_include_mentions: true,

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
        		spinner = undefined;
        		this.loading = false;
        		clearTimeout(this.spin_timer);
        		this.spin_timer = null;
        	}

        },
        spinStart: function(){
        	this.spin_counter = 2;
        	this.loading = true;
        	var target = document.getElementById('spinner');
        	spinner = new Spinner(opts).spin(target);
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

        }
    },
    mounted: function(){
        this.mounted = true;
        this.spinStop(true);
        this.show_articles = false;
        this.show_graphs = false;

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
