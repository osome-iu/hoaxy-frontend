var max_articles = 20;

var TWEET_URL = "https://twitter.com/%0/status/%1";
var debug = false;
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
        show_full_articles_list: false,
        show_graphs: false,
        show_zoom_buttons: false,
        graph_column_size: 3,

        info_text: '',

        articles: [],
        articles_to_show: max_articles,
        search_disabled: true,
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
        searched_query_text: "",
        query_sort: "relevant",
        query_include_mentions: true,

        checked_articles: [],


        twitter_account_info: {},
        twitter: {},
        twitter_result_type: 'mixed',

        globalHoaxyTimeline: null,
        globalTwitterSearchTimeline: null,

        timeline: null,
        graph: null,
        getting_bot_scores: {running: false},

        copiedWidgetText: false,
        widgetScreenshotDataUrl: "",
        showWidgetModal: false,
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

        graphAnimation: {
            playing: false,
            increment: 0,
            total_increments: 240,
            current_timestamp: 0,
            paused: false
        },

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
        colors: colors,
        searchBy: 'Hoaxy',
        searchedBy: '',
        searchPlaceholder: 'Example: vaccines',
        hoaxySearchSelected: true,
        twitterSearchSelected: false,
        // Edge lists
        twitterEdges: [],
        hoaxyEdges: [],
        // Twitter timeline
        twitterTimeline: {
          claim: {
            timestamp: [],
            volume: []
          },
          fact_checking: {
            timestamp: [],
            volume: []
          }
        },
        // Used to disable animation if there is nothing to animate
        animationAvailable: true,
        // Used to only paginate up to 1000 nodes
        twitterUserSet: new Set(),
        twitterDates: [],
        // Used for rendering top articles
        popular_articles: {
          claim: [],
          fact_checking: [],
        },
        top_claim_articles: [],
        top_fact_checking_articles: [],
        top_usa_articles: [],

        scrollTop: 0,
        tooltip: {
            title: "",
            show: false,
            top: 0,
            left: 0,
        },

        tutorial: {
            active_slide: 1,
            show: false,
            // hiddenByCookie: false
        }

    },
    computed: {
        controls_margin_top: function(){
            var h = document.getElementById('articles_controls') && document.getElementById('articles_controls').offsetHeight;
            var lh = document.getElementById('article_list') && document.getElementById('article_list').offsetHeight;
            try{
                // console.debug(h, this.scrollTop,this.getOffset('articles').top, this.getOffset('article_list').bottom);

                if( this.getOffset('articles').top + lh - h <= this.scrollTop  + 20)
                {
                    var r = lh - h;
                    return r + 'px';
                }
                else if ( this.scrollTop > this.getOffset('articles').top - 20)
                {
                    return (this.scrollTop - this.getOffset('articles').top  + 20) + 'px';
                }
                else
                {
                    return 0;
                }
            }catch(er){
                return 0;
            }
            // return this.show_full_articles_list ? (
            //          ? (
            //             (this.scrollTop - this.getOffset('articles').top) + 'px'
            //         ): (
            //             this.scrollTop + h > this.getOffset('articles_list').bottom ? (
            //                 (this.getOffset('articles_list').bottom - h) + 'px'
            //             ):(
            //                 0
            //             )
            //         )
            //     ) : (0);
        },
        embeddedWidgetCode: function () {
          return "<div style=\"width:250px;padding:5px;border:solid;border-width:thin;border-color:gray;border-radius:10px;\"><div>Use Hoaxy to see how this spreads online: <a href=\"" + location.href + "\" target=\"_blank\">" + this.searched_query_text + "</div><div><hr style=\"position:relative;left:-5px;border-width:think;border-color:gray;color:gray;background-color:gray;height:1px;width:260px;border:none;\"><img style=\"width:250;height:250px;\" src=\"" + this.widgetScreenshotDataUrl + "\"></img></div></div>"
        }
        // : function(){
        //     if(!this.graph)
        //     {
        //         return false;
        //     }
        //     return this.graph.playing();
        // }

    },

    // #     #
    // ##   ## ###### ##### #    #  ####  #####   ####
    // # # # # #        #   #    # #    # #    # #
    // #  #  # #####    #   ###### #    # #    #  ####
    // #     # #        #   #    # #    # #    #      #
    // #     # #        #   #    # #    # #    # #    #
    // #     # ######   #   #    #  ####  #####   ####

    methods: {

        tutorialNextSlide: function(){
            if(this.tutorial.active_slide < 5)
            {
                this.tutorial.active_slide += 1;
            }
        },
        tutorialPreviousSlide: function(){
            if(this.tutorial.active_slide > 1)
            {
                this.tutorial.active_slide -= 1;
            }
        },
        tutorialGotoSlide: function(slide_number)
        {
            // console.debug(slide_number);
            this.tutorial.active_slide = slide_number;
        },
        tutorialHide: function(){
            this.tutorial.show = false;
            // document.cookie="HideHoaxyTutorial=true;max-age=31536000";
        },
        tutorialHideWithCookie: function(){
            this.tutorial.show = false;
            document.cookie="HideHoaxyTutorial=true;max-age=31536000";
        },


        hoverTooltip: function(e){
            var element = e.target;
            var element_offset = this.getOffset(element);
            this.tooltip.title= element.title;
            this.tooltip.show= true;
            this.tooltip.top= element_offset.bottom;
            this.tooltip.left= element_offset.left;
            element.title = "";

        },
        hideTooltip: function(e){
            var target = e.target;
            target.title = this.tooltip.title;
            this.tooltip.title= "";
            this.tooltip.show= false;
            this.tooltip.top= 0;
            this.tooltip.left= 0;
        },
        twitterSearch: function() {
          this.twitter_result_type = 'mixed'
          this.searchBy = "Twitter"
          this.searchPlaceholder = 'Examples: vaccines, www.wsj.com';
          this.twitterSearchSelected = true
          this.hoaxySearchSelected = false
          // Focus back on the search box
          this.$refs.searchBox.focus()
        },
        hoaxySearch: function() {
          this.query_sort = "relevant";
          this.searchBy = "Hoaxy"
          this.searchPlaceholder = 'Example: vaccines';
          this.hoaxySearchSelected = true
          this.twitterSearchSelected = false
          // Focus back on the search box
          this.$refs.searchBox.focus()
        },
        // hoaxyExpandSearch: function() {
        //   v.scrollToElement("graphs");
        // },
        formatTime: function(time){
            return moment(time).format("MMM D YYYY h:mm a");
        },
        stripWwwIfPresent: function(url) {
          if (url.substring(0, 4) == "www.") {
            return url.substring(4, );
          } else {
            return url;
          }
        },
        prepareAndShowWidgetCode: function() {
          var graphRenderer = this.graph.getRenderer();
          this.widgetScreenshotDataUrl = graphRenderer.snapshot({
            format: 'jpg',
            background: 'white',
            labels: true
          });
          this.showWidgetModal = true;
        },
        copyWidgetCodeToClipboard: function() {
          this.$refs.widgetCodeTextArea.select();
          document.execCommand('copy');
          this.copiedWidgetText = true;
        },
        resetWidgetContent: function() {
          this.showWidgetModal = false;
          this.copiedWidgetText = false;
        },
        focusSearchBox: function() {
          this.search_disabled = false;
          // this.show_articles = false;
          // this.show_graphs = false;
        },
        formatArticleType: function(type){
          if(type == "claim")
            return "claims";
          if(type == "fact_checking")
            return "fact checking articles"
          return "";
        },
        shortenArticleText: function(text) {
          if (text.length > 50) {
            shortened_text = text.substr(0,49) + "..."
            return(shortened_text)
          } else {
            return(text)
          }
        },
        getTopUsaArticles: function(){
          this.spinStart();

          var newsArticlesLocation = window.location.origin + '/news_sources/top-news-usa.json';

          var request = axios.get(newsArticlesLocation, {
            dataType: 'json'
          });
          var v = this;
          request.then(
            function(response){
              var topArticles = response.data;
              for (var i = 0; i < 3; i++)
              {
                topArticles[i].source = v.stripWwwIfPresent(v.attemptToGetUrlHostName(topArticles[i].url));
                topArticles[i]['shortened_headline'] = v.shortenArticleText(topArticles[i].headline);
                v.top_usa_articles.push(topArticles[i]);
              }
              v.spinStop();
            },
            function (error) {
              console.log("Get Top Articles Request failed: " + error.response.statusText);
              v.spinStop();
            }
          );


        },
        getPopularArticles: function(){
          this.spinStart();
          var request = axios.get(configuration.top_articles_url, {
            headers: configuration.top_articles_headers,
            dataType: 'json'
          });
          var v = this;
          request.then(
            function(response){
              response = response.data;
              var articles = response.articles;

              var claimNum = 0;
              var factCheckNum = 0;
              for(var i in articles)
              {
                // Talying up claims and fact-checking articles acquired
                var a = articles[i];
                if (a.site_type == 'claim') {
                  claimNum++;
                  // If more than 3 claims are acquired, we continue to the next iteration of the loop
                  if (claimNum > 3) {
                    continue;
                  }
                  a.source = v.stripWwwIfPresent(v.attemptToGetUrlHostName(a.canonical_url));
                  a['shortened_title'] = v.shortenArticleText(a.title);
                  v.top_claim_articles.push(a);
                } else {
                  factCheckNum++;
                  // If more than 3 fact checks are acquired, we continue to the next iteration of the loop
                  if (factCheckNum > 3) {
                    continue;
                  }
                  a.source = v.stripWwwIfPresent(v.attemptToGetUrlHostName(a.canonical_url));
                  a['shortened_title'] = v.shortenArticleText(a.title)
                  v.top_fact_checking_articles.push(a);
                }
              }
              v.spinStop();
            },
            function (error) {
              alert("Get Articles Request failed: " + error.response.statusText);
              v.spinStop();
            }
          );
        },
        getSubsetOfArticles: function(){
            return this.articles.slice(0, this.articles_to_show);
        },
        getDateline: function(url_pub_date){
            // console.debug(url_pub_date);
            var pub_date = moment(url_pub_date);
            var dateline = pub_date.format('MMM D, YYYY');
            return dateline;
        },
        attemptToGetUrlHostName: function(url){
          var urlLink = document.createElement("a");
          urlLink.href = url;
          if (window.location.hostname == urlLink.hostname) {
            // Element was not a link so we return "Not Avalable"
            return "Not Available";
          } else {
            // Return hostname e.g. www.host-stuff.com
            return(urlLink.hostname);
          }
        },
        attemptToGetUrlHostPath: function(url){
          var urlLink = document.createElement("a");
          urlLink.href = url;
          if (window.location.hostname == urlLink.hostname) {
            // Element was not a link so we return null
            return null;
          } else {
            // Return hostname and pathname of url to re-construct principal components of an url e.g. <hostname><pathname> or www.host-stuff.com/pathstuff
            return(urlLink.hostname + urlLink.pathname);
          }
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
            var h = element.offsetHeight;

            while (element = element.offsetParent) {
                x += element.offsetLeft;
                y += element.offsetTop;
            }

            return { left: x, top: y, bottom: y + h};
        },

        scrollToElement: function(id){
            var adjustment = 0;
            // if(this.searchBy === "Hoaxy" && id === "graphs")
            // {
            //     //if we're in hoaxy mode, we never want to go directly to the graph... we want to go
            //     // slightly above so that we can see the article list
            //     adjustment = document.getElementById("article_list").children[0].offsetHeight * 1.5;
            //     var o = this.getOffset("article_list").bottom - adjustment;
            //     if(document.getElementById(id))
            //     {
            //         window.scroll(0,o);
            //     }
            // }
            // else
            {
                if(document.getElementById(id))
                {
                    var o = this.getOffset(id).top - adjustment;
                    window.scroll(0,o);
                }
            }
            this.loadShareButtons();
        },
        directSearchDashboard: function(article, dashSource) {
          // Change query selection settings and populate the search box
          this.changeAndFocusSearchQuery(article, dashSource);
          // Submit the form
          this.submitForm();
        },
        changeAndFocusSearchQuery: function(article, dashSource) {
          // If news is mainstream (comes from the News API) then we automatically toggle Twitter search, if not, we use Hoaxy
          if (dashSource == 'mainstream') {
            this.searchBy = 'Twitter';
            this.twitterSearchSelected = true;
            this.hoaxySearchSelected = false;
          } else {
            this.searchBy = 'Hoaxy';
            this.twitterSearchSelected = false;
            this.hoaxySearchSelected = true;
          }
          // change article query
          this.query_text = article;
          // focus on the search box
          this.$refs.searchBox.focus();
        },
        changeURLParamsHoaxy: function(){
            var query_string = "query=" + encodeURIComponent(this.query_text) + "&sort=" + this.query_sort + "&type=" + this.searchBy;
            location.hash = query_string;
            return query_string;
        },
        changeURLParamsTwitter: function(){
            var query_string = "query=" + encodeURIComponent(this.query_text) + "&sort=" + this.twitter_result_type + "&type=" + this.searchBy;
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
                this.search_disabled = true;
                clearTimeout(this.spin_timer);
            }
            // console.debug(key, this.spin_key_table);
        },
        spinStart: function(key){
            // console.debug(key);
            this.spin_key_table.push(key);
            this.loading = true;
            this.input_disabled = true;
            this.search_disabled = true;
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
        formatDate: function(unFormattedDate) {
          // UnFormatted date should come as 'Day Mo DD HH:MM:SS +0000 YYYY' which must be parsed and changed
          // Changing to the YYYY-MM-DDTHH:MM:SSZ date format
          var createdAtArray = unFormattedDate.split(" ");
          // Invoking the moment.js package to yield us the number months
          var month = moment.monthsShort().indexOf(createdAtArray[1]) + 1;
          var monthStr = month.toString();
          // Padding the month with an extra prefix 0 in case it is just length of one i.e. 8 -> 08
          if (monthStr.length == 1) {
            monthStr = "0" + monthStr;
          }
          // Parsing HH:MM:SS part
          var hourMinSec = createdAtArray[3].split(":");
          // Creating final formatted date
          var formattedDate = createdAtArray[5] + "-" + monthStr + "-" + createdAtArray[2] + "T" + hourMinSec[0] + ":" + hourMinSec[1] + ":" + hourMinSec[2] + "Z";
          return(formattedDate);
        },
        sortDates: function(dateOne, dateTwo) {
          if (dateOne > dateTwo) {
            return 1;
          }
          if (dateOne < dateTwo) {
            return -1;
          }
          // Dates Equal
          return 0;
        },
        createTwitterDateBins: function(dates) {
          // USED FOR DEBUGGING THE DATES
          // console.log('NUMBER OF DATES');
          // console.log(dates.length);
          //
          // console.log('DATES');
          // for (var date in dates) {
          //   console.log(dates[date]);
          // }

          var v = this;
          var numBins = 0;
          var offsetBin = 0;
          var dateBins = [];
          // Finding least date
          var leastDate = dates[0].getTime();
          // Finding latest date
          var latestDate = dates[dates.length-1].getTime();
          // Finding the offset between the latest date and least date in seconds
          var offsetSec = Math.ceil(Math.abs(latestDate - leastDate)/1000);

          // Dynamically creating the number of bins based on the difference between the least and latest date
          if (offsetSec < 600) {
            // Bins should be divided in seconds because the difference is between 0 and 10 minutes
            numBins = offsetSec + 1;
            // Seconds offset
            offsetBin = 1000;
          }
          else if (offsetSec < 36000) {
            // Bins should be divided in minutes because the difference is between 10 minutes and 10 hours
            numBins = Math.ceil(offsetSec/60) + 1;
            // Minutes offset
            offsetBin = 60*1000;
          }
          else if (offsetSec < 864000) {
            // Bins should be divided in hours because the difference is between 10 hours and 10 days
            numBins = Math.ceil(offsetSec/(60*60)) + 1;
            // Hours offset
            offsetBin = 60*60*1000;
          }
          else {
            // Bins should be divided in days because the difference is more than 10 days
            numBins = Math.ceil(offsetSec/(24*60*60)) + 1;
            // Days offset
            offsetBin = 24*60*60*1000;
          }

          // Creating bins
          for (var bin = 0; bin <= numBins; bin++) {
            dateBins.push(leastDate + bin*offsetBin);
          }

          // Populating the date bins with number of tweets in each bin
          var bin = 0;
          var numTweets = 0;
          for (var theDate = 0; theDate < dates.length; theDate++){
            if (dates[theDate].getTime() <= dateBins[bin]) {
              numTweets+=1;
            }
            else {
              // next date exceeded current bin, so must move on to next bin(s)
              while (dates[theDate].getTime() > dateBins[bin]) {
                var offsetDate = new Date(dateBins[bin]);
                v.twitterTimeline.claim.timestamp.push(offsetDate);
                v.twitterTimeline.claim.volume.push(numTweets);
                v.twitterTimeline.fact_checking.timestamp.push(offsetDate);
                v.twitterTimeline.fact_checking.volume.push(0);
                bin+=1;
              }
              numTweets+=1;
            }
            // adding the last date
            if (theDate == dates.length-1) {
              var offsetDate = new Date(dateBins[bin]);
              v.twitterTimeline.claim.timestamp.push(offsetDate);
              v.twitterTimeline.claim.volume.push(numTweets);

              v.twitterTimeline.fact_checking.timestamp.push(offsetDate);
              v.twitterTimeline.fact_checking.volume.push(0);
            }
          }

          // If there is only one timestamp then we create another helpful time tick to visualize a full bin
          // if (numBins == 1) {
          //   var offsetDate = new Date(dateBins[bin+1]);
          //   v.twitterTimeline.claim.timestamp.push(offsetDate);
          //   v.twitterTimeline.claim.volume.push(numTweets);
          //   v.twitterTimeline.fact_checking.timestamp.push(offsetDate);
          //   v.twitterTimeline.fact_checking.volume.push(0);
          // }

          console.debug(v.twitterTimeline.claim);
        },
        resetTwitterSearchResults: function() {
          // Re-enabling animation
          this.animationAvailable =  true;
          // Reset Twitter Edge list
          this.twitterEdges = [];
          // Reset Twitter timeline
          this.twitterTimeline = {
            claim: {
              timestamp: [],
              volume: []
            },
            fact_checking: {
              timestamp: [],
              volume: []
            }
          };
          // Used to only paginate up to 1000 nodes
          this.twitterUserSet = new Set();
          this.twitterDates = [];
        },
        resetHoaxySearchResults: function() {
          // Re-enabling animation
          this.animationAvailable =  true;
          this.hoaxyEdges = [];
        },
        buildTwitterEdgesTimeline: function(twitterEntities){
          this.spinStart("buildGraph");
          this.spinner_notices.timeline = "Building Graph and Timeline...";

          // Edge object
          function TwitterEdge() {
            this.canonical_url="";
            this.date_published="";
            this.domain="";
            this.from_user_id="";
            this.from_user_screen_name="";
            this.id=undefined;
            this.is_mention= false;
            this.pub_date= "";
            this.site_domain="";
            this.site_type="claim";
            this.title="";
            this.to_user_id="";
            this.to_user_screen_name="";
            this.tweet_created_at="";
            this.tweet_id="";
            this.tweet_type="";
            this.url_id= undefined;
            this.url_raw="";
          }

          var v = this;

          // Looping over twitter results and adding the articles that we need to further get timelines and graphs of
          // USED FOR DEBUGGING
          // console.log("twitter entities:");
          // console.log(twitterEntities);
          var totalTwitterEntities = twitterEntities.length;
          var key = totalTwitterEntities;
          // Used to maintain data integrity
          var nonNullFrom = false;
          var nonNullTo = false;
          // Function used for updating the edges and timeline from retweets, quotes, and mentions
          function updateEdgesAndTimeline(typeOfTweet) {
            try {
              twitterEdge.tweet_id = twitterEntities[key].id_str;
            } catch(err) {
                twitterEdge.tweet_id = "";
            }
            var formattedDate = v.formatDate(twitterEntities[key].created_at);
            v.twitterDates.push(new Date(formattedDate));

            // Updating edges
            twitterEdge.date_published = formattedDate;
            twitterEdge.pub_date = formattedDate;
            twitterEdge.tweet_created_at = formattedDate;
            twitterEdge.tweet_type = typeOfTweet;
            v.twitterEdges.push(twitterEdge);
          }

          while (key > 0) {
            key = key - 1;
            // Checking for quotes
            nonNullFrom = false;
            nonNullTo = false;
            if (twitterEntities[key].quoted_status) {

              var twitterEdge = new TwitterEdge();

              try {
                twitterEdge.from_user_id = twitterEntities[key].quoted_status.user.id_str;
                v.twitterUserSet.add(twitterEdge.from_user_id);
                nonNullFrom = true;
              } catch(err) {
                twitterEdge.from_user_id = "";
              }

              try {
                twitterEdge.from_user_screen_name = twitterEntities[key].quoted_status.user.screen_name;
                nonNullFrom = true;
              } catch(err) {
                twitterEdge.from_user_screen_name = "";
              }

              try {
                twitterEdge.to_user_id = twitterEntities[key].user.id_str;
                v.twitterUserSet.add(twitterEdge.to_user_id);
                nonNullTo = true;
              } catch(err) {
                twitterEdge.to_user_id = "";
              }

              try {
                twitterEdge.to_user_screen_name = twitterEntities[key].user.screen_name;
                nonNullTo = true;
              } catch(err) {
                twitterEdge.to_user_screen_name = "";
              }

              if (nonNullFrom && nonNullTo) {
                // Populate the rest of the edge entities
                updateEdgesAndTimeline("quote");
              }

            }

            // Checking for retweets
            nonNullFrom = false;
            nonNullTo = false;
            if (twitterEntities[key].retweeted_status) {

              var twitterEdge = new TwitterEdge();

              try {
                twitterEdge.from_user_id = twitterEntities[key].retweeted_status.user.id_str;
                v.twitterUserSet.add(twitterEdge.from_user_id);
                nonNullFrom = true;
              } catch(err) {
                twitterEdge.from_user_id = "";
              }

              try {
                twitterEdge.from_user_screen_name = twitterEntities[key].retweeted_status.user.screen_name;
                nonNullFrom = true;
              } catch(err) {
                twitterEdge.from_user_screen_name = "";
              }

              try {
                twitterEdge.to_user_id = twitterEntities[key].user.id_str;
                v.twitterUserSet.add(twitterEdge.to_user_id);
                nonNullTo = true;
              } catch(err) {
                twitterEdge.to_user_id = "";
              }

              try {
                twitterEdge.to_user_screen_name = twitterEntities[key].user.screen_name;
                nonNullTo = true;
              } catch(err) {
                twitterEdge.to_user_screen_name = "";
              }

              if (nonNullFrom && nonNullTo) {
                // Populate the rest of the edge entities
                // Attempting to retrieve tweet id
                updateEdgesAndTimeline("retweet");
              }
            } else {
              // Checking for mentions
              // Mentions will only occur if the Tweet entity is not a retweet so also doing this check here
              if (twitterEntities[key].entities.user_mentions.length > 0) {
                nonNullFrom = false;
                nonNullTo = false;
                // Mentions found, creating edges for each one
                for (var mention = 0; mention < twitterEntities[key].entities.user_mentions.length; mention++) {
                  var twitterEdge = new TwitterEdge();
                  twitterEdge.is_mention = true;

                  try {
                    twitterEdge.from_user_id = twitterEntities[key].user.id_str;
                    v.twitterUserSet.add(twitterEdge.from_user_id);
                    nonNullFrom = true;
                  } catch(err) {
                    twitterEdge.from_user_id = "";
                  }

                  try {
                    twitterEdge.from_user_screen_name = twitterEntities[key].user.screen_name;
                    nonNullFrom = true;
                  } catch(err) {
                    twitterEdge.from_user_screen_name = "";
                  }

                  try {
                    twitterEdge.to_user_id = twitterEntities[key].entities.user_mentions[mention].id_str;
                    v.twitterUserSet.add(twitterEdge.to_user_id);
                    nonNullTo = true;
                  } catch(err) {
                    twitterEdge.to_user_id = "";
                  }

                  try {
                    twitterEdge.to_user_screen_name = twitterEntities[key].entities.user_mentions[mention].screen_name;
                    nonNullTo = true;
                  } catch(err) {
                    twitterEdge.to_user_screen_name = "";
                  }

                  if (nonNullFrom && nonNullTo) {
                    // Populate the rest of the edge entities
                    updateEdgesAndTimeline("mention");
                  }
                }
              }
            }
          }
          v.spinStop("buildGraph");
        },
        buildTwitterGraph: function() {
          var v = this;
          // Checking if any edges were found and if not, show message to user to try another query
          if (v.twitterEdges.length == 0) {
            v.show_zoom_buttons = false;
            v.failed_to_get_network = true;
            v.spinner_notices.graph = "";
            v.show_graphs = true;
            Vue.nextTick(function(){
                v.graph.updateEdges(v.twitterEdges);
                v.updateGraph();
                v.spinStop("generateNetwork");
                v.scrollToElement("secondary_form");
            });
            v.spinStop("buildGraph");
          }
          else {
            // USED FOR DEBUGGING
            // console.log("twitter edges:");
            // console.log(v.twitterEdges);
            // console.log("twitter dates:");
            // console.log(v.twitterDates);

            // Edges found so create the graph
            // Re-initialize the edges/timeline if there was a query before
            v.graph.updateEdges([]);
            // Starting with the TimeLine
            //sorting timeline in ascending order
            v.twitterDates.sort(v.sortDates);
            //creating date bins
            v.createTwitterDateBins(v.twitterDates);
            v.spinner_notices.timeline = "";
            v.spinStart("updateTimeline");
            v.show_graphs = true;
            //update the timeline on the next tick because at this point
            // the graphs are still hidden. Graphs will be visible on the
            // next tick
            Vue.nextTick(function(){
                v.timeline.update(v.twitterTimeline);
                v.spinStop("updateTimeline");
                v.scrollToElement("secondary_form");
                v.timeline.redraw();
            });

            this.spinStart("getNetwork");
            this.spinner_notices.graph = "Fetching graph...";

            this.timeline.removeUpdateDateRangeCallback();
            this.failed_to_get_network = false;

            v.spinStop("getNetwork");
            v.spinner_notices.graph = "Drawing Graph...";
            v.spinStart("generateNetwork");

            v.show_graphs = true;

            Vue.nextTick(function(){
                // USED FOR DEBUGGING
                // console.log("POST EDGES:");
                // console.log(v.twitterEdges);
                // console.log(typeof(v.twitterEdges));
                v.graph.updateEdges(v.twitterEdges);
                v.updateGraph();
                v.spinStop("generateNetwork");
                v.scrollToElement("secondary_form");
            });

            v.spinStop("buildGraph");
          }
        },
        getTwitterSearchResults: function(query){
            this.spinStart("getTwitterSearchResults");
            this.spinner_notices.timeline = "Searching Twitter...";
            var v = this;
            var response = undefined;
            // Ensuring that the search encoding follows Twitter search standards: https://developer.twitter.com/en/docs/tweets/search/guides/standard-operators
            // Query string is already being URI encoded so we don't explicitly encode it
            var query_string = query;
            // Will later be used for pagination
            var max_id = "";
            // This function will paginate tweet search requests and is recursive
            function paginateTwitterRequests() {
              tweetsReponse = v.twitter.getTweets(query_string, max_id, v.twitter_result_type);
              // Handling the get Tweets response
              tweetsReponse.then(function(response){
                if (response.search_metadata.next_results) {
                  // Retrieving the maximum id for which the next result we must return tweets smaller than, hence older than this tweet
                  max_id = response.statuses[response.statuses.length-1].id_str;
                } else {
                  // No need to make another request as we are done (there are no more responses left)
                  query_string = "";
                }
                v.buildTwitterEdgesTimeline(response.statuses);
                // Check if pagination must continue, if the number of nodes on the graph exceeds 1000 we don't send additional requests
                if (v.twitterUserSet.size < 1000 && query_string != "") {
                  // Continue pagination
                  paginateTwitterRequests()
                } else {
                  // Stop pagination
                  v.spinStop("getTwitterSearchResults");
                  // Create timeline and graph given the Twitter results
                  v.buildTwitterGraph();
                  // Check if animation should be disabled or not
                  v.checkIfShouldDisableAnimation(v.twitterEdges);
                }
              }, function(){})
              .catch(function(error){
                // USED FOR DEBUGGING
                // console.log("Twitter Search Pagination Error:");
                // console.log(error);
                v.spinStop("getTwitterSearchResults");
                v.displayError("Twitter Search Pagination Error: " + error);
              });
            }
            // Function will paginate Twitter Search tweets, then build the timeline/graph
            paginateTwitterRequests();
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
                    // v.show_articles = true;
                    if(!dontScroll)
                    {
                        v.scrollToElement("articles");
                    }

                    // if(debug)
                    // {
                    //     console.log("DEBUG");
                    //     v.checked_articles.push(v.articles[0].url_id);
                    //     v.checked_articles.push(v.articles[1].url_id);
                    //     v.checked_articles.push(v.articles[2].url_id);
                    //     v.checked_articles.push(v.articles[3].url_id);
                    //     v.getTimeline(v.checked_articles);
                    //     v.getNetwork(v.checked_articles);
                    // }

                    // Visualizing only the first claim by default
                    v.checked_articles.push(v.articles[0].url_id);
                    v.getTimeline(v.checked_articles);
                    v.getNetwork(v.checked_articles);

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
                    v.show_articles = true;
                    //update the timeline on the next tick because at this point
                    // the graphs are still hidden. Graphs will be visible on the
                    // next tick
                    Vue.nextTick(function(){
                        v.timeline.update(msg.timeline);
                        v.spinStop("updateTimeline");
                        v.scrollToElement("secondary_form");
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
                    v.show_articles = true;

                    Vue.nextTick(function(){
                        edge_list = msg.edges.map(function(x){
                            y = x;
                            y.site_domain = x.domain;
                            y.pub_date = x.publish_date;
                            y.url_raw = x.canonical_url;
                            return y;
                        });
                        // console.log("HOAXY PRE STUFF:");
                        // console.log(edge_list);
                        // Adding hoaxy edges to memory in case user wants to download the restuls as csv
                        v.hoaxyEdges = edge_list;
                        v.graph.updateEdges(edge_list);
                        v.updateGraph();
                        // v.timeline.redraw();
                        //Check if the animation should be disabled or not
                        v.checkIfShouldDisableAnimation(v.hoaxyEdges);
                        v.scrollToElement("secondary_form");
                    });



                    //after the botcache request is complete,
                    // update the graph even if the request fails
                    // if it fails, it just won't have the bot scores
                    // v.timeline.updateDateRange();

                },
                function (error) {
                    var error_message = "";
                    if(error.response)
                    {
                        error_message = error.response.statusText;
                    }
                    else
                    {
                        error_message = "Unknown error, likely a problem connecting to API server.";
                    }

                    v.displayError("Get Graph Request failed: " + error_message);
                    console.log('Network Graph Request Error', error_message);
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
            this.graph.startAnimation();
        },
        stopGraphAnimation: function(){
            this.graph.stopAnimation();
            // this.graphAnimation.current_timestamp = 0;
        },
        pauseGraphAnimation: function(){
            this.graph.pauseAnimation();
        },
        unpauseGraphAnimation: function(){
            this.graph.unpauseAnimation();
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
        buildCSVContent: function(edgeList) {
          this.spinStart("createCSV");
          var csvFile = "data:text/csv;charset=utf-8,";
          var csvData = [];
          //Constructing and pushing header row to csv data
          var headerRow = [];
          //Finding all relevant keys and creating the header row
          var firstEdge = edgeList[0];
          Object.keys(firstEdge)
                .forEach(function(key, ix) {
                    headerRow.push(key);
                 });
          //Adding final computed column called tweet_url
          headerRow.push("tweet_url")
          //Sorting results for cleanliness
          headerRow.sort()
          csvData.push(headerRow)
          //Iterating through edge list and building data rows where each row is an edge
          var numEdges = edgeList.length;
          if (numEdges > 0) {
              for (var edgeNum = 0; edgeNum < numEdges; edgeNum++) {
                var dataRow = [];
                for (var keyIx = 0; keyIx < headerRow.length; keyIx++) {
                  if (edgeList[edgeNum].hasOwnProperty(headerRow[keyIx])) {
                    if (headerRow[keyIx] == "title") {
                      // Quote delimiting the article title to deal with comma delimitation problems (e.g. "hello, world" will now be treated as one column in a csv and not two)
                      dataRow.push("\"" + edgeList[edgeNum][headerRow[keyIx]] + "\"");
                    } else {
                      dataRow.push(edgeList[edgeNum][headerRow[keyIx]]);
                    }
                  } else {
                    if (headerRow[keyIx] == "tweet_url") {
                      dataRow.push("https://twitter.com/" + String(edgeList[edgeNum]['from_user_screen_name']) + "/status/" + String(edgeList[edgeNum]['tweet_id']));
                    }
                  }
                }
                // Finishing and adding one row of data
                csvData.push(dataRow);
              }
          }
          // Constructing csv file from data
          csvData.forEach(function(dataRow){
            var literalRow = dataRow.join(",");
            csvFile += literalRow + "\r\n";
          });
          // Preparing csv file for download
          var encodedCSVUri = encodeURI(csvFile);
          var downloadLink = document.createElement("a");
          downloadLink.setAttribute("href", encodedCSVUri);
          downloadLink.setAttribute("download", "hoaxy_visualization.csv");
          document.body.appendChild(downloadLink);
          this.spinStop("createCSV");
          // File will be downloaded now
          downloadLink.click();
        },
        createAsCSV: function() {
          if (this.hoaxyEdges.length > 0) {
            // Creating Hoaxy CSV
            this.buildCSVContent(this.hoaxyEdges);
          }
          else if (this.twitterEdges.length > 0) {
            // Creating Twitter CSV
            this.buildCSVContent(this.twitterEdges);
          }
        },
        submitForm: function(dontScroll){
          // Resets any results from any previous queries
          this.resetTwitterSearchResults();
          this.resetHoaxySearchResults();
    	    if(this.searchBy == 'Hoaxy') {
        		this.show_articles = false;
        		this.show_graphs = false;
        		this.checked_articles = [];
        		if(!this.query_text)
        		{
              this.displayError("You must input a claim.");
              this.spinStop(true);
              return false;
        		}
            // Preparing the proper timeline to show
            this.timeline = this.globalHoaxyTimeline;
            // Adding a url querystring so that user can replicate a query by copy/pasting the url
        		this.changeURLParamsHoaxy();
        		this.getArticles(dontScroll);
        		this.spinStop();
      	  }
      	  else if(this.searchBy == 'Twitter') {
            this.show_articles = false;
        		this.show_graphs = false;
        		this.checked_articles = [];
        		if(!this.query_text)
        		{
              this.displayError("You must input a valid search query.");
              this.spinStop(true);
              return false;
        		}
            // Preparing the proper timeline to show
            this.timeline = this.globalTwitterSearchTimeline;
            // Adding a url querystring so that user can replicate a query by copy/pasting the url
            this.changeURLParamsTwitter();
            var searchUrl = this.attemptToGetUrlHostPath(this.query_text);
            if (searchUrl != null) {
              // If the search query was a URL, run the query through a URL search
              this.getTwitterSearchResults(searchUrl);
            } else {
              // Otherwise, search query was basic text
              this.getTwitterSearchResults(encodeURIComponent(this.query_text));
            }
        		this.spinStop();
      	  }
          // Populating the network title as the query text
          this.searched_query_text = this.query_text;
          // Rendering styling of the timeline and graph depending on the search
          this.searchedBy = this.searchBy;
        },
        checkIfShouldDisableAnimation: function(edges) {
          if (edges.length > 0) {
            var localAnimationAvailable = false;
            var pubDate = edges[0]['tweet_created_at'];
            for (var edgeIx = 0; edgeIx < edges.length; edgeIx++) {
              var newPubDate = edges[edgeIx]['tweet_created_at'];
              // There are at least two different dates so we can animate this edge list
              if (newPubDate != pubDate) {
                localAnimationAvailable = true;
                break;
              }
            }
            this.animationAvailable = localAnimationAvailable;
          }
        },
        visualizeSelectedArticles: function(){
            this.show_graphs = false;
            this.show_full_articles_list = false;
            this.$nextTick(function(){
                this.scrollToElement("article_list");
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
            });
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
            this.scrollToElement("secondary_form");
        },
        loadShareButtons: function(){
            twttr.widgets.load();
			FB.XFBML.parse();
        }
    },
    watch: {
        query_sort: function() {
          // Checking if value is changed and refocusing on the search box
          this.$refs.searchBox.focus();
        },
        twitter_result_type: function () {
          // Checking if value is changed and refocusing on the search box
          this.$refs.searchBox.focus();
        },
        "show_graphs": function(){

        },
        "graphAnimation.current_timestamp": function(){
          this.timeline.updateTimestamp();
        },
    },


    //  #     #
    //  ##   ##  ####  #    # #    # ##### ###### #####
    //  # # # # #    # #    # ##   #   #   #      #    #
    //  #  #  # #    # #    # # #  #   #   #####  #    #
    //  #     # #    # #    # #  # #   #   #      #    #
    //  #     # #    # #    # #   ##   #   #      #    #
    //  #     #  ####   ####  #    #   #   ###### #####
    beforeMount: function() {
      // Retrieving popular articles to show them in the dashboard
      this.getPopularArticles();
      // Retrieving top trending articles to show them in the dashboard
      this.getTopUsaArticles();
    },
    mounted: function(){
        this.mounted = true;
        this.show_articles = false;
        this.show_graphs = false;

        var cookies = document.cookie.split("; ");
        if(cookies.indexOf("HideHoaxyTutorial=true") == -1)
        {
            this.tutorial.show = true;
        }
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
        // If there's a hash querystring, populate the form with that data by default
        // First character is a #, so we must remove this in order to properly parse the query string
        var params = location.hash.substring(1, location.hash.length).split("&");

        // Note that this logic currently requires the query, sort, and type parameters to come in that exact order.
        // If this order is changed, the code will no longer work
        var discerningSortBasedOnHoaxyOrTwitter = "";
        for (var i in params)
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
              discerningSortBasedOnHoaxyOrTwitter = value;
            }
            if(key == "type")
            {
              this.searchBy = value;
              if (this.searchBy == 'Hoaxy')
              {
                this.hoaxySearchSelected = true;
                this.twitterSearchSelected = false;
                this.query_sort = discerningSortBasedOnHoaxyOrTwitter;
              }
              else if (this.searchBy == 'Twitter')
              {
                this.twitterSearchSelected = true;
                this.hoaxySearchSelected = false;
                this.twitter_result_type = discerningSortBasedOnHoaxyOrTwitter;
              }
            }
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
            twitter: this.twitter,
            graphAnimation: this.graphAnimation
        });

        //create the chart that is used to visualize the timeline
        // the updateGraph function is a callback when the timeline interval is adjusted
        this.globalHoaxyTimeline = new HoaxyTimeline({updateDateRangeCallback: this.updateGraph, graphAnimation: this.graphAnimation});
        this.globalTwitterSearchTimeline = new TwitterSearchTimeline({updateDateRangeCallback: this.updateGraph, graphAnimation: this.graphAnimation});
        this.timeline = this.globalHoaxyTimeline


        // this.timeline.chart.interactiveLayer.dispatch.on("elementClick", function(e){
        //
        //     v.pauseGraphAnimation();
        //     v.graphAnimation.current_timestamp = Math.floor(e.pointXValue);
        //     v.graphAnimation.increment = 0;
    		// v.graphAnimation.playing  = true;
    		// v.graphAnimation.paused = true;
        //     v.unpauseGraphAnimation();
        //     v.pauseGraphAnimation();
        //
        //     // console.debug(new Date(e.pointXValue))
        // });

        this.globalHoaxyTimeline.chart.interactiveLayer.dispatch.on("elementClick", function(e){

            v.pauseGraphAnimation();
            v.graphAnimation.current_timestamp = Math.floor(e.pointXValue);
            v.graphAnimation.increment = 0;
            v.graphAnimation.playing  = true;
            v.graphAnimation.paused = true;
            v.unpauseGraphAnimation();
            v.pauseGraphAnimation();

            // console.debug(new Date(e.pointXValue))
        });

        this.globalTwitterSearchTimeline.chart.interactiveLayer.dispatch.on("elementClick", function(e){

            v.pauseGraphAnimation();
            v.graphAnimation.current_timestamp = Math.floor(e.pointXValue);
            v.graphAnimation.increment = 0;
            v.graphAnimation.playing  = true;
            v.graphAnimation.paused = true;
            v.unpauseGraphAnimation();
            v.pauseGraphAnimation();

            // console.debug(new Date(e.pointXValue))
        });

        // this.displayError("Test Error");

        this.spinStop("initialLoad");
        console.debug("Vue Mounted.");

        //if we prepopulated the form with query string data, submit the form right away
        if(this.query_text)
        {
            this.submitForm(true);
        }

        var debounce_timer = 0;
        window.addEventListener('scroll', function(){
            clearTimeout(debounce_timer);
            debounce_timer = 0;
            debounce_timer = setTimeout( function(){
                v.scrollTop = window.pageYOffset;
            }, 50);
        });

    }
});
