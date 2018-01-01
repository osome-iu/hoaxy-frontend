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
        show_graphs: false,
        show_zoom_buttons: false,
        graph_column_size: 3,

        info_text: '',

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
        twitter_result_type: 'mixed',

        globalHoaxyTimeline: null,
        globalTwitterSearchTimeline: null,

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
        searchBy: 'hoaxy',

        // Edge list
        twitterEdges: [],
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
        // Used to only paginate up to 1000 nodes
        twitterUserSet: new Set(),
        twitterDates: []
    },
    computed: {
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
        getUrlHostPath: function(url){
          var urlLink = document.createElement("a");
          urlLink.href = url;
          return(urlLink.hostname + urlLink.pathname);
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
        formatDate2: function(unFormattedDate) {
          // Changing to the YYYY-MM-DDT00:00:00Z date format
          var createdAtArray = unFormattedDate.split(" ");
          // Invoking the moment.js package to yield us the number months
          var month = moment.monthsShort().indexOf(createdAtArray[1]) + 1;
          var monthStr = month.toString();
          // Padding the month with an extra prefix 0 in case it is just length of one i.e. 8 -> 08
          if (monthStr.length == 1) {
            monthStr = "0" + monthStr;
          }
          // Creating final formatted date
          var formattedDate = createdAtArray[5] + "-" + monthStr + "-" + createdAtArray[2] + "T00:00:00Z";
          return(formattedDate);
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
        createTwitterDateBins: function(dates, bins) {
          var v = this;
          var dateBins = [];
          // Finding least date
          var leastDate = dates[0].getTime();
          // console.log("least date");
          // console.log(leastDate);
          var latestDate = dates[dates.length-1].getTime();
          // console.log("latest date");
          // console.log(latestDate);
          // Difference between greatest date and least date in milliseconds
          var offsetMil = Math.abs(latestDate - leastDate);
          // console.log("offset mil");
          // console.log(offsetMil);
          // Creating bins from the difference
          var offsetBin = Math.ceil(offsetMil/bins);
          // console.log("offset bin");
          // console.log(offsetBin);
          // Creating binned Dates
          for (var bin = 1; bin <= bins; bin++) {
            dateBins.push(leastDate + bin*offsetBin);
          }
          // console.log("date bins");
          // console.log(dateBins);
          // Adding a 0 tweet initial bin
          var initialDate = new Date(dates[0].getFullYear(), dates[0].getMonth(), dates[0].getDate());
          v.twitterTimeline.claim.timestamp.push(initialDate);
          v.twitterTimeline.claim.volume.push(0);
          v.twitterTimeline.fact_checking.timestamp.push(initialDate);
          v.twitterTimeline.fact_checking.volume.push(0);
          // Populating the date bins with number of tweets in each bin
          var bin = 0;
          var numTweets = 0;
          for (var theDate = 0; theDate < dates.length; theDate++){
            // console.log("the date");
            // console.log(dates[theDate]);
            // console.log("mill");
            // console.log(dates[theDate].getTime());
            if (dates[theDate].getTime() < dateBins[bin]) {
              numTweets+=1;
            }
            else {
              // next date exceeded current bin, so must move on to next bin(s)
              while (dates[theDate].getTime() > dateBins[bin]) {
                var offsetDate = new Date(dateBins[bin]);
                // console.log("offset date");
                // console.log(offsetDate);
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
              // console.log("offset date");
              // console.log(offsetDate);
              v.twitterTimeline.claim.timestamp.push(offsetDate);
              v.twitterTimeline.claim.volume.push(numTweets);

              v.twitterTimeline.fact_checking.timestamp.push(offsetDate);
              v.twitterTimeline.fact_checking.volume.push(0);
            }
          }
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
          // var twitterEntities = tweetsResponse.statuses;
          console.log("twitter entities");
          console.log(twitterEntities);
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
            console.log("no edges found");

            v.show_zoom_buttons = false;
            v.failed_to_get_network = true;
            v.spinner_notices.graph = "";
            v.show_graphs = true;
            Vue.nextTick(function(){
                v.graph.updateEdges(v.twitterEdges);
                v.updateGraph();
                v.spinStop("generateNetwork");
                v.scrollToElement("graphs");
            });
            v.spinStop("buildGraph");
            return "ok";
          }
          else {
            console.log("twitter edges");
            console.log(v.twitterEdges);
            console.log("twitter dates");
            console.log(v.twitterDates);
            // Edges found so create the graph

            // Starting with the TimeLine
            //sorting timeline in ascending order
            v.twitterDates.sort(v.sortDates);
            //creating date bins
            v.createTwitterDateBins(v.twitterDates, 100);
            v.spinner_notices.timeline = "";
            v.spinStart("updateTimeline");
            v.show_graphs = true;
            //update the timeline on the next tick because at this point
            // the graphs are still hidden. Graphs will be visible on the
            // next tick
            Vue.nextTick(function(){
                v.timeline.update(v.twitterTimeline);
                v.spinStop("updateTimeline");
                v.scrollToElement("graphs");
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
                console.log("POST EDGES:");
                console.log(v.twitterEdges);
                console.log(typeof(v.twitterEdges));
                v.graph.updateEdges(v.twitterEdges);
                v.updateGraph();
                v.spinStop("generateNetwork");
                v.scrollToElement("graphs");
            });

            v.spinStop("buildGraph");
            return true;
          }
        },
        getTwitterSearchResults: function(query){
            var test = this.getUrlHostPath();
            this.spinStart("getTwitterSearchResults");
            this.spinner_notices.timeline = "Searching Twitter...";
            var v = this;
            var response = undefined;
            // In this particular case we are obtaining the query as a string, i.e. "cute kitties" and not "cute" and "kitties" separately
            // Hence we need to convert the query into a quote-string URI i.e. cute%23kitties
            var query_string = query.replace(" ","%23");
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
                // twitterEntities.push.apply(twitterEntities, response.statuses);
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
                  // var twitterBuiltGraphTimeline = v.buildTwitterSearchTimelineAndGraph(twitterEntities);
                  return true;
                }
              }, function(){})
              .catch(function(error){
                console.log("Twitter Search Pagination Error:");
                console.log(error);
                v.spinStop("getTwitterSearchResults");
                return false;
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
                    v.show_articles = true;
                    if(!dontScroll)
                    {
                        v.scrollToElement("articles");
                    }

                    if(debug)
                    {
                        console.log("DEBUG");
                        v.checked_articles.push(v.articles[0].url_id);
                        v.checked_articles.push(v.articles[1].url_id);
                        v.checked_articles.push(v.articles[2].url_id);
                        v.checked_articles.push(v.articles[3].url_id);
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
                        console.log("HOAXY PRE STUFF:");
                        console.log(edge_list);
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
        submitForm: function(dontScroll){
    	    if(this.searchBy == 'hoaxy') {
        		this.show_articles = false;
        		this.show_graphs = false;
        		this.checked_articles = [];
        		if(!this.query_text)
        		{
              this.displayError("You must input a claim.");
              this.spinStop(true);
              return false;
        		}
        		this.changeURLParams();
        		this.getArticles(dontScroll);
        		this.spinStop();
      	  }
      	  else if(this.searchBy == 'twitter') {
            this.show_articles = false;
        		this.show_graphs = false;
        		this.checked_articles = [];
        		if(!this.query_text)
        		{
              this.displayError("You must input a valid search query.");
              this.spinStop(true);
              return false;
        		}
            var tweetsResponse = this.getTwitterSearchResults(this.query_text);
        		this.spinStop();
      	  }
          else if(this.searchBy == 'twitter-url') {
            this.show_articles = false;
        		this.show_graphs = false;
        		this.checked_articles = [];
        		if(!this.query_text)
        		{
              this.displayError("You must input a valid search query.");
              this.spinStop(true);
              return false;
        		}
            // Retrieving the host and path from url
            this.query_text = this.getUrlHostPath(this.query_text);
            var tweetsResponse = this.getTwitterSearchResults(this.query_text);
        		this.spinStop();
          }
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
        "graphAnimation.current_timestamp": function(){

                // this.timeline.removeUpdateDateRangeCallback();
                // this.timeline.update(this.timeline.getLastData());
                // this.timeline.redraw();
                this.timeline.updateTimestamp();
        },
        // "twitter.me": function(){
        //     console.info("twitter");
        //     this.twitter_authorized = !!this.twitter.me();
        //     console.debug(this.twitter.me());
        //     console.debug(this.twitter_authorized);
        // }
        // "graph.playing": function(){
        //     if(this.graph.playing === true)
        //     {
        //         this.animationPlaying = true;
        //     }
        //     else
        //     {
        //         this.animationPlaying = false;
        //     }
        // }
        searchBy: function() {
          this.show_articles = false;
          this.show_graphs = false;


          if (this.searchBy == 'hoaxy') {
            this.timeline = this.globalHoaxyTimeline;
            console.log("changed to hoaxy timeline");
          }
          else {
            this.timeline = this.globalTwitterSearchTimeline;
            console.log("changed to twitter search timeline");
          }
        }
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
    }
});
