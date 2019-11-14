// Static
var max_articles = 20;

var defaultProfileImage = "static/assets/Twitter_logo_blue_32-cropped.png";

var defaultHoaxyLang = "en";

var papa_parse_config =
{
	delimiter: "",	// "" = auto-detect
	newline: "",	  // "" = auto-detect
	quoteChar: '"',
	escapeChar: '"',
	header: true,
	transformHeader: undefined,
	dynamicTyping: false,
	preview: 0,
	encoding: "",
	worker: false,
	comments: false,
	step: undefined,
	complete: undefined,
	error: undefined,
	download: false,
	skipEmptyLines: false,
	chunk: undefined,
	fastMode: undefined,
	beforeFirstChunk: undefined,
	withCredentials: undefined,
	transform: undefined,
	delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
};

var papa_unparse_config =
{
	quotes: false, //or array of booleans
	quoteChar: '"',
	escapeChar: '"',
	delimiter: ",",
	header: true,
	newline: "\r\n",
	skipEmptyLines: false, //or 'greedy',
	columns: null //or array of strings
};

var TWEET_URL = "https://twitter.com/%0/status/%1";
var debug = false;
var colors = {
  node_colors : {
    "fact_checking" : 'darkblue',
    "claim" : 'darkblue',
    "botscores": [
      {red: 215, green: 25, blue: 28} ,
      {red: 253, green: 174, blue: 97} ,
      {red: 255, green: 255, blue: 191} ,
      {red: 171, green: 221, blue: 164} ,
      {red: 62, green: 182, blue: 229}
		]
  },
  edge_colors : {
    "fact_checking" : 'rgb(238,210,2)',
    "fact_checking_dark" : 'rgb(169, 171, 2)',
    "claim" : 'darkgray',
    "claim_dark" : 'gray'
  }
};

var app = new Vue({
  el: '#vue-app',
  data: function() {
    return {

      //  ######    ##   #####   ##
      //  #     #  #  #    #    #  #
      //  #     # #    #   #   #    #
      //  #     # ######   #   ######
      //  #     # #    #   #   #    #
      //  ######  #    #   #   #    #
      import_or_search: "search",
      ready_to_visualize: false,

      imported_file_type: "",

      imported_data: null,

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

      profile:
      {
        name: "",
        image: defaultProfileImage
      },

      twitter_account_info: {},
      twitter: {},
      twitter_result_type: 'mixed',

      globalHoaxyTimeline: null,
      globalTwitterSearchTimeline: null,

      timeline: null,
      graph: null,
      getting_bot_scores:
      {
        running: false
      },

      copiedWidgetText: false,
      widgetScreenshotDataUrl: "",
      showWidgetModal: false,
      show_error_modal: false,
      error_message: "",
      show_authenticate_modal: false,
      show_edge_modal: false,
      show_node_modal: false,
      show_tutorial_link: true,
      show_tutorial_modal: false,
      modal_opacity: false,
      edge_modal_content: {
        edge: {},
        tweet_urls: {},
        label_string: ""
      },
      node_modal_content: {
        staleAcctInfo:
        {
          isStale: false,
          newId: '',
          oldSn: '',
          newSn: ''
        },
        showStaleContent: true,
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
        completeAutomationProbability: 0,
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

      source_dropdown_open: false,
      colors: colors,
      searchBy: 'Hoaxy',
      searchedBy: '',
      searchPlaceholder: 'Example: vaccines',
      hoaxySearchSelected: true,
      twitterSearchSelected: false,

      lang: '',

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

      // Object that is passed between graph and main app which discerns
      // whether user has hit the rate limits, and if so, proper alerts
      // are shown
      twitterRateLimitReachedObj: {
        isReached: false
      },

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
      },
      menu_open: false,

      nodes_filtered_by_score: false
    };
  },
  computed: {
    /**
     * Helper function to prepare top 20 articles to be checked
     * @return {Boolean} Whether there are 20 checked articles or not
     */
    all_selected: function()
    {
      return this.checked_articles.length === 20;
    },

    /**
     * Return botscore count within a specified score range  \
     * (between 0 and .9, 1 and 1.9, etc.)
     * @return {Number} The number of botscores in the range
     */
    botscoreCount: function() 
    {
      return function(min, max) 
      {
        var scores = Object.values(this.graph.botscores());
        var filtered_scores = scores.filter(function(val){
          if(val.score >= min && val.score < max)
          {
            return true;
          }
          else
          {
            return false;
          }
        });
        return filtered_scores.length;
      };
    },

    /**
     * Places HTML with Vue variables into a widget modal \
     * Contains "Embed" functionality
     * @return {String} HTML that will create the "Embed" widget modal
     */
    embeddedWidgetCode: function () 
    {
      return ''
        + '<link rel="stylesheet" href="' + location.origin + (location.pathname !== '/'?location.pathname:'') + '/static/css/widget.css" />'
        + '<div class="hoaxy-widget">'
        +   '<div class="hoaxy-widget-leftdiv">'
        +       '<div class="hoaxy-widget-leftdiv-toplogo">'
        +           '<img src="' + location.origin + (location.pathname !== '/'?location.pathname:'') + '/static/widget_images/HoaxyLogo.png" />'
        +       '</div>'
        +       '<div class="hoaxy-widget-leftdiv-bottominfo">'
        +           'Use Hoaxy to see how this spreads online: '
        +           '<a href="' + location.href + '" target="_blank">'
        +           this.shortenArticleText(this.searched_query_text, 100) + '</a>'
        +       '</div>'
        +   '</div>'
        +   '<div class="hoaxy-widget-rightdiv">'
        +       '<img class="hoaxy-widget-rightdiv-imgvis" src="' + this.widgetScreenshotDataUrl + '"/>'
        +   '</div>'
        + '</div>';
    },

    /**
     * Decides what the tooltip will say depending \
     * on whether it's searching via Twitter/Hoaxy
     * @return {String} The tooltip's text
     */
    searchByDependencyTitle: function () 
    {
      return (this.searchBy == "Hoaxy") ? "enter any phrase": "enter any phrase or link";
    }
  },

  // ##     ## ######## ######## ##     ##  #######  ########   ######  
  // ###   ### ##          ##    ##     ## ##     ## ##     ## ##    ## 
  // #### #### ##          ##    ##     ## ##     ## ##     ## ##       
  // ## ### ## ######      ##    ######### ##     ## ##     ##  ######  
  // ##     ## ##          ##    ##     ## ##     ## ##     ##       ## 
  // ##     ## ##          ##    ##     ## ##     ## ##     ## ##    ## 
  // ##     ## ########    ##    ##     ##  #######  ########   ######  
  methods: {
    /**
     * Login to Twitter for connected functionality
     */
    logIn: function()
    {
      var v = this;
      var p = this.twitterLogIn();
      p.then(function(response)
      {
        v.twitter_account_info = userData;
        v.profile.image = userData.profile_image_url_https;
        v.profile.name = "@" + userData.screen_name;
      })
    },

    /**
     * Logout of Twitter
     */
    logOut: function()
    {
      var v = this;
      var p = this.twitterLogOut();

      p.then(function(response)
      {
        v.profile.name = "";
        v.profile.image = defaultProfileImage;
      })
    },

    /**
     * Prepares uploaded file for visualization import
     * @param  {Object} evt The file upload event
     */
    fileUploadHandler: function(evt)
    {
      // Start with Visualize button disabled.
      this.ready_to_visualize = false;

      var file = evt.target.files[0]; 
      var appFileType = file.type;
      // Cut off "application/" section of file type.
      appFileType = appFileType.substr(12);
      
      var textFileType = file.type;
      // Cut off "text/" section of file type.
      textFileType = textFileType.substr(5);

      var reader = new FileReader();
      var vm = this;

      // Check file type, and if valid, remember it.
      // Enable the Visualize button.
      // Parse file appropriately.
      if(appFileType == "json")
      {
        vm.imported_file_type = "json";
        vm.ready_to_visualize = true;

        reader.onload = (function() 
        {
          return function(e) 
          {
            var json_string = (e.target.result);
            vm.imported_data = JSON.parse(json_string);
            vm.ready_to_visualize = true;
          };
        })(file);
      }
      else if (textFileType == "csv" || textFileType == "x-csv" || textFileType == "plain" || appFileType == "vnd.ms-excel")
      {
        vm.imported_file_type = "csv";
        vm.ready_to_visualize = true;
        
        reader.onload = (function() 
        {
          return function(e) 
          {
            var csv_string = (e.target.result);
            var rows = vm.parseCSV(csv_string);
            vm.imported_data = rows;
            vm.ready_to_visualize = true;
          };
        })(file);
      }
      else
      {
        alert("File type should be .csv or .json");
        vm.ready_to_visualize = false;
      } 
  
      reader.readAsText(file);
    },

    /**
     * Parse the imported CSV to prep for visualization
     * @param  {String} csv_string The imported .CSV file
     * @return {Object} The object containing the rows of data
     */
    parseCSV: function(csv_string)
    {
      var rowstrings = csv_string.split("\r\n");
      var rows = [];
      var header_row = rowstrings[0].split(",");
      
      for(var row of rowstrings)
      {
        var split_row = row.split(",");
        var row_obj = {};
        for(var col_header_index in header_row)
        {
          row_obj[header_row[col_header_index]] = split_row[col_header_index];
        }

        rows.push(row_obj);
      }
      return rows;
    },

    /**
     * Visualize the imported .CSV or .JSON file
     */
    visualizeImportedData: function()
    {
      var v = this;

      v.spinStart("visualizeImportedData");

      setTimeout(function(){
        v.globalTwitterSearchTimeline = new TwitterSearchTimeline({
          updateDateRangeCallback: v.updateGraph, 
          graphAnimation: v.graphAnimation
        });
        v.globalTwitterSearchTimeline.chart.interactiveLayer.dispatch.on("elementClick", function(e){
          v.pauseGraphAnimation();
          v.graphAnimation.current_timestamp = Math.floor(e.pointXValue);
          v.graphAnimation.increment = 0;
          v.graphAnimation.playing  = true;
          v.graphAnimation.paused = true;
          v.unpauseGraphAnimation();
          v.pauseGraphAnimation();
      });
      v.timeline = v.globalTwitterSearchTimeline;

      var data = v.imported_data;
      // Removing header row from CSV file
      if(v.imported_file_type == "csv")
      {
        data.shift();
      }       

      v.resetTwitterSearchResults();
      v.resetHoaxySearchResults();

      // Using the original search URL to restore search terms into search box
      var urlHash = decodeURI(data[0].original_query);
      var urlVars = String(urlHash).split('&');
      var urlKeyValues = String(urlVars).split('=');
      var urlKeyValues = String(urlKeyValues).split(',');

      v.query_text = urlKeyValues[1];
      v.searched_query_text = urlKeyValues[1];
      v.searchBy = urlKeyValues[5];
      v.searchedBy = urlKeyValues[5];
      v.lang = urlKeyValues[7]

      if(v.searchBy == 'Hoaxy')
      {
        v.hoaxySearchSelected = true;
        v.twitterSearchSelected = false;
        v.hoaxyEdges.original_query = data[0].original_query;
        v.changeURLParamsHoaxy();
      }
      else
      {
        v.hoaxySearchSelected = false;
        v.twitterSearchSelected = true;
        v.twitterEdges.original_query = data[0].original_query;
        v.changeURLParamsTwitter();
      }
      
      // Loop filling twitterEdge data with imported_data
      for(var i in data)
      {
        var edge = data[i];
        
        edge.date_published = edge.tweet_created_at;
        edge.pub_date = edge.tweet_created_at;
        
        var newdate = new Date(edge.pub_date);
        if(!(newdate instanceof Date && !isNaN(newdate)))
        {
          continue;
        }

        if(edge.from_user_botscore != "")
        {
          v.graph.setBotScore(edge.from_user_id, edge.from_user_botscore);
        }
        if(edge.to_user_botscore != "")
        {
          v.graph.setBotScore(edge.to_user_id, edge.to_user_botscore);
        }
        
        // Coming in as strings from CSV when they should be booleans
        if(edge.is_mention.toString().toUpperCase() == "TRUE")
        {
          edge.is_mention = true;
        }
        if(edge.is_mention.toString().toUpperCase() == "FALSE")
        {
          edge.is_mention = false;
        }

        v.twitterEdges.push(edge);
        v.twitterDates.push(newdate);
        v.twitterUserSet.add(edge.from_user_id);
        v.twitterUserSet.add(edge.to_user_id);
      }

      // <div>{{graph.score_stats.found}} of {{graph.score_stats.total}} scores found.</div>

      // true meaning we won't reset scores
      // v.buildTwitterGraph(true);
      v.buildTwitterGraph(false);

      // Check if animation should be disabled or not
      v.checkIfShouldDisableAnimation(v.twitterEdges);

      v.spinStop("visualizeImportedData");
        }, 250);
      },

    /**
     * Selects the top 20 articles to prep for visualization
     */
    selectTop20: function()
    {
      var articles = this.getSubsetOfArticles();
      var is_checked = this.all_selected;

      this.checked_articles = [];
      if(!is_checked)
      {
        for(var i = 0; i < 20; i+=1)
        {
          if(i >= articles.length)
          {
            break;
          }
          this.checked_articles.push(articles[i].url_id);
        }
      }
    },

    /**
     * Move to the next tutorial slide \
     * and keep an index of the current slide
     */
    tutorialNextSlide: function()
    {
      if(this.tutorial.active_slide < 5)
      {
        this.tutorial.active_slide += 1;
      }
    },

    /**
     * Move to the previous tutorial slide \
     * and keep an index of the current slide
     */
    tutorialPreviousSlide: function()
    {
      if(this.tutorial.active_slide > 1)
      {
        this.tutorial.active_slide -= 1;
      }
    },

    /**
     * Move to a specific tutorial slide
     */
    tutorialGotoSlide: function(slide_number)
    {
      this.tutorial.active_slide = slide_number;
    },

    /**
     * Hide the tutorial
     */
    tutorialHide: function()
    {
      this.tutorial.show = false;
    },

    /**
     * Hide the tutorial and make sure it does not show up next visit
     */
    tutorialHideWithCookie: function()
    {
      this.tutorial.show = false;
      document.cookie="HideHoaxyTutorial=true;max-age=31536000";
    },

    /**
     * Custom hover tooltip showing functionality
     * @param  {Object} e the mouse hover event
     * @todo   Replace with Bootstrap-Vue
     */
    hoverTooltip: function(e)
    {
      var element = e.target;
      var element_offset = this.getOffset(element);
      this.tooltip.title= element.title;
      this.tooltip.show= true;
      this.tooltip.top= element_offset.bottom;
      this.tooltip.left= element_offset.left;
      element.title = "";
    },

    /**
     * Custom hover tooltip hiding functionality
     * @param  {Object} e the mouse hover event
     * @todo   Replace with Bootstrap-Vue
     */
    hideTooltip: function(e)
    {
      var target = e.target;
      target.title = this.tooltip.title;
      this.tooltip.title= "";
      this.tooltip.show= false;
      this.tooltip.top= 0;
      this.tooltip.left= 0;
    },

    /**
     * Only color nodes within a score range
     * @param  {Number} min bottom of the score range
     * @param  {Number} max top of the score range
     */
    filterNodesByScore: function(min, max)
    {
      // if we double click on a color
      if(this.nodes_filtered_by_score === max + " " + min)
      {
        // display all nodes
        this.graph.filterNodesByScore();
        this.nodes_filtered_by_score = false;
      }
      else
      {
        // display only the filtered nodes
        this.graph.filterNodesByScore(max, min);
        this.nodes_filtered_by_score = max + " " + min;
      }
    },

    //  ######  ########    ###    ########   ######  ##     ##    ######## ##     ## ##    ##  ######  ######## ####  #######  ##    ##  ######  
    // ##    ## ##         ## ##   ##     ## ##    ## ##     ##    ##       ##     ## ###   ## ##    ##    ##     ##  ##     ## ###   ## ##    ## 
    // ##       ##        ##   ##  ##     ## ##       ##     ##    ##       ##     ## ####  ## ##          ##     ##  ##     ## ####  ## ##       
    //  ######  ######   ##     ## ########  ##       #########    ######   ##     ## ## ## ## ##          ##     ##  ##     ## ## ## ##  ######  
    //       ## ##       ######### ##   ##   ##       ##     ##    ##       ##     ## ##  #### ##          ##     ##  ##     ## ##  ####       ## 
    // ##    ## ##       ##     ## ##    ##  ##    ## ##     ##    ##       ##     ## ##   ### ##    ##    ##     ##  ##     ## ##   ### ##    ## 
    //  ######  ######## ##     ## ##     ##  ######  ##     ##    ##        #######  ##    ##  ######     ##    ####  #######  ##    ##  ######  

    /**
     * Used to set variables to handle a Twitter search
     */
    twitterSearch: function() 
    {
      this.twitter_result_type = 'mixed';
      this.searchBy = "Twitter";
      this.searchPlaceholder = 'Examples: vaccines, www.wsj.com';
      this.twitterSearchSelected = true;
      this.hoaxySearchSelected = false;
    },

    /**
     * Used to set variables to handle a Hoaxy search
     */
    hoaxySearch: function() 
    {
      this.query_sort = "relevant";
      this.searchBy = "Hoaxy";
      this.searchPlaceholder = 'Example: vaccines';
      this.hoaxySearchSelected = true;
      this.twitterSearchSelected = false;
    },

    /**
     * Prepares the graph for visualization
     * @todo   Check for redundant code
     */
    initializeHoaxyTimeline: function() 
    {
      var v = this;
      this.globalHoaxyTimeline = new HoaxyTimeline({updateDateRangeCallback: this.updateGraph, graphAnimation: this.graphAnimation});
      this.globalHoaxyTimeline.chart.interactiveLayer.dispatch.on("elementClick", function(e){
        v.pauseGraphAnimation();
        v.graphAnimation.current_timestamp = Math.floor(e.pointXValue);
        v.graphAnimation.increment = 0;
        v.graphAnimation.playing  = true;
        v.graphAnimation.paused = true;
        v.unpauseGraphAnimation();
        v.pauseGraphAnimation();
      });
      this.timeline = this.globalHoaxyTimeline;
    },

    /**
     * Prepares the graph for visualization
     * @todo   Check for redundant code
     */
    initializeTwitterTimeline: function() 
    {
      var v = this;
      this.globalTwitterSearchTimeline = new TwitterSearchTimeline({updateDateRangeCallback: this.updateGraph, graphAnimation: this.graphAnimation});
      this.globalTwitterSearchTimeline.chart.interactiveLayer.dispatch.on("elementClick", function(e){
        v.pauseGraphAnimation();
        v.graphAnimation.current_timestamp = Math.floor(e.pointXValue);
        v.graphAnimation.increment = 0;
        v.graphAnimation.playing  = true;
        v.graphAnimation.paused = true;
        v.unpauseGraphAnimation();
        v.pauseGraphAnimation();
      });
      this.timeline = this.globalTwitterSearchTimeline;
    },

    /**
     * Formats time to 'MMM D YYYY h:mm a' format
     * @param  {String} time The timestamp from the node modal
     * @return {String} The formatted time
     */
    formatTime: function(time)
    {
      return moment(time).format("MMM D YYYY h:mm a");
    },

    /**
     * Strips a url of 'www.'
     * @param  {String} url
     * @return {String} The formatted url without 'www.'
     */
    stripWwwIfPresent: function(url) 
    {
      if (url.substring(0, 4) == "www.") 
      {
        return url.substring(4);
      } 
      else 
      {
        return url;
      }
    },

    /**
     * Prepares the embed screenshot and widget modal
     */
    prepareAndShowWidgetCode: function() 
    {
      var graphRenderer = this.graph.getRenderer();
      this.widgetScreenshotDataUrl = graphRenderer.snapshot({
        format: 'png',
        background: 'white',
        labels: true
      });
      this.showWidgetModal = true;
    },

    /**
     * Copies the html embed widget to the user's clipboard
     */
    copyWidgetCodeToClipboard: function() 
    {
      this.$refs.widgetCodeTextArea.select();
      document.execCommand('copy');
      this.copiedWidgetText = true;
    },

    /**
     * Hides the html embed widget modal \
     * and sets copiedWidgetText flag to false
     */
    resetWidgetContent: function() 
    {
      this.showWidgetModal = false;
      this.copiedWidgetText = false;
    },

    /**
     * If the search box is focused, enable searching
     */
    focusSearchBox: function() 
    {
      this.search_disabled = false;
    },

    /**
     * Stringifies the article type
     * @param  {String} type The type of the article
     * @return {String} The extended string representing the article type
     */
    formatArticleType: function(type)
    {
      if(type == "claim")
        return "claims";
      if(type == "fact_checking")
        return "fact checking articles"
      return "";
    },

    /**
     * Truncates article text with an added elipses.
     * @param  {String} text The text from the headline of the article
     * @param  {Number} text_length The desired length to truncate to
     * @return {String} The truncated text
     */
    shortenArticleText: function(text, text_length) 
    {
      if (text && text.length > parseInt(text_length)) 
      {
        shortened_text = text.substr(0, parseInt(text_length)-1) + "..."
        return(shortened_text)
      } 
      else 
      {
        return(text)
      }
    },

    /**
     * Retrieve the top 3 articles for "Trending News"
     */
    getTopUsaArticles: function()
    {
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
            topArticles[i]['shortened_source'] = v.stripWwwIfPresent(v.attemptToGetUrlHostName(topArticles[i].url)).toUpperCase();
            topArticles[i]['shortened_headline'] = v.shortenArticleText(topArticles[i].headline, 70);
            v.top_usa_articles.push(topArticles[i]);
          }
          v.spinStop();
        },
        function (error){
          console.log("Get Top Articles Request failed: ", error);
          v.spinStop();
        }
      );
    },

    /**
     * Retrieve the top 3 "Popular Claims" and "Popular Fact-Checks"
     */
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
            if (a.site_type == 'claim') 
            {
              claimNum++;
              // If more than 3 claims are acquired, we continue to the next iteration of the loop
              if (claimNum > 3) 
              {
                continue;
              }
              // a.source = v.shortenArticleText(a.canonical_url, 47);
              a['shortened_source'] = v.stripWwwIfPresent(v.attemptToGetUrlHostName(a.canonical_url)).toUpperCase();
              a['shortened_headline'] = v.shortenArticleText(a.title, 70);
              v.top_claim_articles.push(a);
            } 
            else 
            {
              factCheckNum++;
              // If more than 3 fact checks are acquired, we continue to the next iteration of the loop
              if (factCheckNum > 3) 
              {
                continue;
              }
              // a.source = v.shortenArticleText(a.canonical_url, 47);
              a['shortened_source'] = v.stripWwwIfPresent(v.attemptToGetUrlHostName(a.canonical_url)).toUpperCase();
              a['shortened_headline'] = v.shortenArticleText(a.title, 70);
              v.top_fact_checking_articles.push(a);
            }
          }
          v.spinStop();
        },
        function (error){
          console.log("Get Articles Request failed: ", error);
          v.spinStop();
        }
      );
    },

    /**
     * Gets a subset of articles up to @articles_to_show
     */
    getSubsetOfArticles: function()
    {
      return this.articles.slice(0, this.articles_to_show);
    },

    /**
     * Formats the date published field of an article to: \
     * 'MMM D, YYYY' with moment
     * @param  {String} url_pub_date The date the article was published
     * @return {String} The formatted date published
     */
    getDateline: function(url_pub_date)
    {
      var pub_date = moment(url_pub_date);
      var dateline = pub_date.format('MMM D, YYYY');
      return dateline;
    },

    /**
     * Extracts the hostname of the URL, if possible
     * @param  {String} url The article link
     * @return {String} The hostname of the article link
     */
    attemptToGetUrlHostName: function(url){
      var urlLink = document.createElement("a");
      urlLink.href = url;
      if (window.location.hostname == urlLink.hostname) 
      {
        // Element was not a link so we return "Not Avalable"
        return "Source Not Available";
      } 
      else 
      {
        // Return capitalized hostname e.g. www.host-stuff.com
        return(urlLink.hostname);
      }
    },

    /**
     * Extracts the article path of the URL, if possible
     * @param  {String} url The article link
     * @return {String} The full path to the article
     */
    attemptToGetUrlHostPath: function(url)
    {
      var urlLink = document.createElement("a");
      urlLink.href = url;
      if (window.location.hostname == urlLink.hostname) 
      {
        // Element was not a link so we return null
        return null;
      } 
      else 
      {
        // Return hostname and pathname of url to re-construct principal components of an url e.g. <hostname><pathname> or www.host-stuff.com/pathstuff
        return(urlLink.hostname + urlLink.pathname);
      }
    },

    /**
     * Get the offset of an HTML element (specifically used for the graph)
     * @param  {Object} element The HTML element to check
     * @return {Object} The offset of the element
     */
    getOffset: function(element)
    {
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

      while (element = element.offsetParent) 
      {
        x += element.offsetLeft;
        y += element.offsetTop;
      }

      return { left: x, top: y, bottom: y + h};
    },

    /**
     * Scroll the window to the element (specifically the graph)
     * @param  {String} id The id of the element
     */
    scrollToElement: function(id)
    {
      var adjustment = 0;
      if(document.getElementById(id))
      {
        var o = this.getOffset(id).top - adjustment;
        window.scroll(0,o);
      }
      this.loadShareButtons();
    },

    /**
     * Directly searches if clicking "Search Link" icon or "Search Title"
     * @param  {String} article The article title/link clicked to search Hoaxy for
     * @param  {String} dashSource The section of the dashboard the article was under
     */
    directSearchDashboard: function(article, dashSource) 
    {
      // Change query selection settings and populate the search box
      this.changeAndFocusSearchQuery(article, dashSource);
      this.submitForm();
    },

    /**
     * Auto-selects Hoaxy or Twitter search and focuses the searchbox
     * @param  {String} article The title/link of the article
     * @param  {String} dashSource The section of the dashboard the article was under 
     */
    changeAndFocusSearchQuery: function(article, dashSource) 
    {
      // If news is mainstream (comes from the News API) then we automatically toggle Twitter search, if not, we use Hoaxy
      if (dashSource == 'mainstream') 
      {
        this.searchBy = 'Twitter';
        this.twitterSearchSelected = true;
        this.hoaxySearchSelected = false;
      } 
      else 
      {
        this.searchBy = 'Hoaxy';
        this.twitterSearchSelected = false;
        this.hoaxySearchSelected = true;
      }
      // change article query
      this.query_text = article;

      if(this.import_or_search == "import")
      {
        this.import_or_search = "search";
      }

      // focus on the search box
      this.$refs.searchBox.focus();
    },

    /**
     * Sets the URL parameters if searching by Hoaxy
     * @return {String} The full query string (to be appended after #)
     * @todo Consider refactoring this and changeURLParamsTwitter() into 1 function
     */
    changeURLParamsHoaxy: function()
    {
      var query_string = "query=" + encodeURIComponent(this.query_text) + "&sort=" + this.query_sort + "&type=" + this.searchBy + "&lang=" + defaultHoaxyLang;
      location.hash = query_string;
      return query_string;
    },

    /**
     * Sets the URL parameters if searching by Twitter
     * @return {String} The full query string (to be appended after #)
     * @todo Consider refactoring this and changeURLParamsHoaxy() into 1 function
     */
    changeURLParamsTwitter: function()
    {
      var query_string = "query=" + encodeURIComponent(this.query_text) + "&sort=" + this.twitter_result_type + "&type=" + this.searchBy + "&lang=" + this.lang;
      location.hash = query_string;
      return query_string;
    },

    /**
     * Stops the loading spinner
     * @param  {String}  key The key of the function in the spin_key_table
     * @param  {Boolean} reset Whether to reset the spinner timeout
     */
    spinStop: function(key, reset)
    {
      var key_index = this.spin_key_table.indexOf(key);
      if(key_index >= 0)
      {
        this.spin_key_table.splice(key_index, 1);
      }
      if(this.spin_key_table.length == 0 || reset === true)
      {
        this.loading = false;
        this.input_disabled = false;
        this.search_disabled = true;
        clearTimeout(this.spin_timer);
      }
    },

    /**
     * Start the loading spinner
     * @param  {String} key The key of the function in the spin_key_table
     */
    spinStart: function(key)
    {
      this.spin_key_table.push(key);
      this.loading = true;
      this.input_disabled = true;
      this.search_disabled = true;
      // timeout after 90 seconds so we're not stuck in an endless spinning loop.
      var v = this;
      clearTimeout(this.spin_timer);
      this.spin_timer = setTimeout(function(){
        v.displayError("The app is taking too long to respond.  Please try again later.");
        console.debug(v.spin_key_table);
        v.spin_key_table.length = 0;
        v.spinStop();
      }, 90000);
    },

    /**
     * Formats the date for the timeline
     * @param  {String} unFormattedDate The incoming date
     * @return {String} The date formatted to 'MM/DD/YYYY hh:mm:ss AM/PM'
     */
    formatDate: function(unFormattedDate) 
    {
      // UnFormatted date should come as 'Day Mo DD HH:MM:SS +0000 YYYY' which must be parsed and changed
      // Changing to the YYYY-MM-DDTHH:MM:SSZ date format
      var createdAtArray = unFormattedDate.split(" ");
      // Invoking the moment.js package to yield us the number months
      var month = moment.monthsShort().indexOf(createdAtArray[1]) + 1;
      var monthStr = month.toString();
      // Padding the month with an extra prefix 0 in case it is just length of one i.e. 8 -> 08
      if (monthStr.length == 1) 
      {
        monthStr = "0" + monthStr;
      }
      // Parsing HH:MM:SS part
      var hourMinSec = createdAtArray[3].split(":");
      // Creating final formatted date
      var formattedDate = createdAtArray[5] + "-" + monthStr + "-" + createdAtArray[2] + "T" + hourMinSec[0] + ":" + hourMinSec[1] + ":" + hourMinSec[2] + "Z";
      return(formattedDate);
    },

    /**
     * Determine which date is first, or if they're the same date
     * @param  {String} dateOne The first date
     * @param  {String} dateTwo The second date
     * @return {Number} dateOne is 1: greater than, -1: less than, 0: equal to dateTwo
     */
    sortDates: function(dateOne, dateTwo) 
    {
      if (dateOne > dateTwo) 
      {
        return 1;
      }
      if (dateOne < dateTwo) 
      {
        return -1;
      }
      // Dates Equal
      return 0;
    },

    /**
     * Create the points in time to check number of tweets
     * @param  {Object[]} dates The dates where tweets occurred
     */
    createTwitterDateBins: function(dates) 
    {
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
      if (offsetSec < 600) 
      {
        // Bins should be divided in seconds because the difference is between 0 and 10 minutes
        numBins = offsetSec + 1;
        // Seconds offset
        offsetBin = 1000;
      }
      else if (offsetSec < 36000) 
      {
        // Bins should be divided in minutes because the difference is between 10 minutes and 10 hours
        numBins = Math.ceil(offsetSec/60) + 1;
        // Minutes offset
        offsetBin = 60*1000;
      }
      else if (offsetSec < 864000) 
      {
        // Bins should be divided in hours because the difference is between 10 hours and 10 days
        numBins = Math.ceil(offsetSec/(60*60)) + 1;
        // Hours offset
        offsetBin = 60*60*1000;
      }
      else 
      {
        // Bins should be divided in days because the difference is more than 10 days
        numBins = Math.ceil(offsetSec/(24*60*60)) + 1;
        // Days offset
        offsetBin = 24*60*60*1000;
      }

      // Creating bins
      for (var bin = 0; bin <= numBins; bin++) 
      {
        dateBins.push(leastDate + bin*offsetBin);
      }

      // Populating the date bins with number of tweets in each bin
      var bin = 0;
      var numTweets = 0;
      for (var theDate = 0; theDate < dates.length; theDate++)
      {
        if (dates[theDate].getTime() <= dateBins[bin]) 
        {
          numTweets+=1;
        }
        else 
        {
          // next date exceeded current bin, so must move on to next bin(s)
          while (dates[theDate].getTime() > dateBins[bin]) 
          {
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
        if (theDate == dates.length-1) 
        {
          var offsetDate = new Date(dateBins[bin]);
          v.twitterTimeline.claim.timestamp.push(offsetDate);
          v.twitterTimeline.claim.volume.push(numTweets);

          v.twitterTimeline.fact_checking.timestamp.push(offsetDate);
          v.twitterTimeline.fact_checking.volume.push(0);
        }
      }
    },

    /**
     * Clear out graph details related to Twitter search
     */
    resetTwitterSearchResults: function() 
    {
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

    /**
     * Clear out graph details related to Hoaxy search
     */
    resetHoaxySearchResults: function() 
    {
      // Re-enabling animation
      this.animationAvailable =  true;
      this.hoaxyEdges = [];
    },

    /**
     * Build Twitter Timeline and Edges: \
     * Prepares the timeline and graph to be displayed
     * @param  {Object} twitterEntities
     * @todo Deeply inspect this function and buildTwitterGraph() \
     * There may be ways to refactor/remove code
     */
    buildTwitterEdgesTimeline: function(twitterEntities)
    {
      this.spinStart("buildGraph");
      this.spinner_notices.timeline = "Building Graph and Timeline...";

      // Edge object
      function TwitterEdge() {
        this.canonical_url="";
        this.date_published="";
        this.domain="";
        this.from_user_botscore="";
        this.from_user_id="";
        this.from_user_screen_name="";
        this.id="";
        this.is_mention= false;
        this.original_query="";
        this.pub_date= "";
        this.site_domain="";
        this.site_type="claim";
        this.title="";
        this.to_user_botscore="";
        this.to_user_id="";
        this.to_user_screen_name="";
        this.tweet_created_at="";
        this.tweet_id="";
        this.tweet_type="";
        this.tweet_url="";
        this.url_id="";
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
      function updateEdgesAndTimeline(typeOfTweet) 
      {
        try 
        {
          twitterEdge.tweet_id = twitterEntities[key].id_str;
        } 
        catch(err) 
        {
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

      while (key > 0) 
      {
        key = key - 1;
        // Checking for quotes
        nonNullFrom = false;
        nonNullTo = false;
        if (twitterEntities[key].quoted_status) 
        {
          var twitterEdge = new TwitterEdge();

          try 
          {
            twitterEdge.from_user_id = twitterEntities[key].quoted_status.user.id_str;
            v.twitterUserSet.add(twitterEdge.from_user_id);
            nonNullFrom = true;
          } 
          catch(err) 
          {
            twitterEdge.from_user_id = "";
          }

          try 
          {
            twitterEdge.from_user_screen_name = twitterEntities[key].quoted_status.user.screen_name;
            nonNullFrom = true;
          } 
          catch(err) {
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

          if (nonNullFrom && nonNullTo) 
          {
            // Populate the rest of the edge entities
            updateEdgesAndTimeline("quote");
          }
        }

        // Checking for retweets
        nonNullFrom = false;
        nonNullTo = false;
        if (twitterEntities[key].retweeted_status) 
        {

          var twitterEdge = new TwitterEdge();

          try 
          {
            twitterEdge.from_user_id = twitterEntities[key].retweeted_status.user.id_str;
            v.twitterUserSet.add(twitterEdge.from_user_id);
            nonNullFrom = true;
          } 
          catch(err) 
          {
            twitterEdge.from_user_id = "";
          }

          try 
          {
            twitterEdge.from_user_screen_name = twitterEntities[key].retweeted_status.user.screen_name;
            nonNullFrom = true;
          } 
          catch(err) 
          {
            twitterEdge.from_user_screen_name = "";
          }

          try 
          {
            twitterEdge.to_user_id = twitterEntities[key].user.id_str;
            v.twitterUserSet.add(twitterEdge.to_user_id);
            nonNullTo = true;
          } 
          catch(err) 
          {
            twitterEdge.to_user_id = "";
          }

          try 
          {
            twitterEdge.to_user_screen_name = twitterEntities[key].user.screen_name;
            nonNullTo = true;
          } 
          catch(err) 
          {
            twitterEdge.to_user_screen_name = "";
          }

          if (nonNullFrom && nonNullTo) 
          {
            // Populate the rest of the edge entities
            // Attempting to retrieve tweet id
            updateEdgesAndTimeline("retweet");
          }
        } 
        else 
        {
          // Checking for mentions
          // Mentions will only occur if the Tweet entity is not a retweet so also doing this check here
          if (twitterEntities[key].entities.user_mentions.length > 0) 
          {
            nonNullFrom = false;
            nonNullTo = false;
            // Mentions found, creating edges for each one
            for (var mention = 0; mention < twitterEntities[key].entities.user_mentions.length; mention++) 
            {
              var twitterEdge = new TwitterEdge();
              twitterEdge.is_mention = true;

              try 
              {
                twitterEdge.from_user_id = twitterEntities[key].user.id_str;
                v.twitterUserSet.add(twitterEdge.from_user_id);
                nonNullFrom = true;
              } 
              catch(err) 
              {
                twitterEdge.from_user_id = "";
              }

              try 
              {
                twitterEdge.from_user_screen_name = twitterEntities[key].user.screen_name;
                nonNullFrom = true;
              } 
              catch(err) 
              {
                twitterEdge.from_user_screen_name = "";
              }

              try 
              {
                twitterEdge.to_user_id = twitterEntities[key].entities.user_mentions[mention].id_str;
                v.twitterUserSet.add(twitterEdge.to_user_id);
                nonNullTo = true;
              } 
              catch(err) 
              {
                twitterEdge.to_user_id = "";
              }

              try 
              {
                twitterEdge.to_user_screen_name = twitterEntities[key].entities.user_mentions[mention].screen_name;
                nonNullTo = true;
              } 
              catch(err) 
              {
                twitterEdge.to_user_screen_name = "";
              }

              if (nonNullFrom && nonNullTo) 
              {
                // Populate the rest of the edge entities
                updateEdgesAndTimeline("mention");
              }
            }
          }
        }
      }
      v.spinStop("buildGraph");
    },

    /**
     * Visualizes the graph with data gathered in buildTwitterEdgesTimeline()
     * @param  {Boolean} dont_reset If true, doesn't reset botscores, cache, or language
     */
    buildTwitterGraph: function(dont_reset) {
      var v = this;

      // Checking if any edges were found and if not, show message to user to try another query
      if (v.twitterEdges.length == 0) 
      {
        v.show_zoom_buttons = false;
        v.failed_to_get_network = true;
        v.spinner_notices.graph = "";
        v.show_graphs = true;
        Vue.nextTick(function(){
          v.graph.updateEdges(v.twitterEdges);
          v.updateGraph();
          v.graph.score_stats.reset();
          
          if(!dont_reset)
          {
            v.graph.resetBotscores();
            v.graph.setLang(v.lang);
            v.graph.getBotCacheScores();
          }
          
          v.spinStop("generateNetwork");
          v.scrollToElement("secondary_form");
        });
        v.spinStop("buildGraph");
      }
      else 
      {
        // Edges found so create the graph
        // Re-initialize the edges/timeline if there was a query before
        v.graph.updateEdges([]);
        // Starting with the Timeline
        // sorting timeline in ascending order
        v.twitterDates.sort(v.sortDates);
        //creating date bins
        v.createTwitterDateBins(v.twitterDates);
        v.spinner_notices.timeline = "";
        v.spinStart("updateTimeline");
        v.show_graphs = true;

        // Update the timeline on the next tick because at this point
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
          v.graph.updateEdges(v.twitterEdges);
          v.updateGraph();
          v.graph.score_stats.reset();
          
          if(!dont_reset)
          {
            v.graph.resetBotscores();
            v.graph.setLang(v.lang);
            v.graph.getBotCacheScores();
          }
          v.spinStop("generateNetwork");
          v.scrollToElement("secondary_form");
        });

        v.spinStop("buildGraph");
      }
    },

    /**
     * Get Twitter search results
     * @param  {String} query What to search on Twitter
     */
    getTwitterSearchResults: function(query)
    {
      this.spinStart("getTwitterSearchResults");
      this.spinner_notices.timeline = "Searching Twitter...";
      var v = this;
      var response = undefined;
      // Ensuring that the search encoding follows Twitter search standards: https://developer.twitter.com/en/docs/tweets/search/guides/standard-operators

      // Query string is already being URI encoded but the getTweets function re-encodes it, so we need to unencode it first so it's not double encoded
      var query_string = decodeURIComponent(query);
      // Will later be used for pagination

      var max_id = "";

      var query_limit = 10;

      var lang = this.lang;

      console.log(lang);

      // This function will paginate tweet search requests and is recursive
      function paginateTwitterRequests() {
        if(lang && lang != undefined && lang != '' && lang != 'any')
        {
          tweetsResponse = v.twitter.getTweets(query_string, lang, max_id, v.twitter_result_type);
        }
        else
        {
          tweetsResponse = v.twitter.getTweets(query_string, '', max_id, v.twitter_result_type);
        }
        // Handling the get Tweets response
        tweetsResponse.then(function(response){
          query_limit -= 1; 
          if (response.search_metadata.next_results) 
          {
            // Retrieving the maximum id for which the next result we must return tweets smaller than, hence older than this tweet
            max_id = response.statuses[response.statuses.length-1].id_str;
          } 
          else 
          {
            // No need to make another request as we are done (there are no more responses left)
            query_string = "";
          }
          v.buildTwitterEdgesTimeline(response.statuses);
          // console.debug(v.twitterUserSet.size, query_limit);
          // Check if pagination must continue, if the number of nodes on the graph exceeds 1000 we don't send additional requests
          if (v.twitterUserSet.size < 1000 && query_string != "" && query_limit > 0) 
          {
            // Continue pagination
            paginateTwitterRequests()
          } 
          else 
          {
            // Stop pagination
            v.spinStop("getTwitterSearchResults");
            // Create timeline and graph given the Twitter results
            v.buildTwitterGraph();
            // Check if animation should be disabled or not
            v.checkIfShouldDisableAnimation(v.twitterEdges);
          }
        }, function(error){
          v.spinStop("getTwitterSearchResults");
          if (error.error.status == 429) 
          {
            v.displayError("Twitter rate limit reached. Try again in 15 minutes.");
          } 
          else 
          {
            v.toggleModal("authenticate", true);
          }
        })
        .catch(function(error){
          console.debug('ERROR CAUGHT');
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

    /**
     * Get articles from database
     * @return  {Promise} The articles asked for
     */
    getArticles: function()
    {
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

          // Visualizing only the first claim by default
          v.checked_articles.push(v.articles[0].url_id);
          v.getTimeline(v.checked_articles);
          v.getNetwork(v.checked_articles);

          v.spinStop("getArticles");
        },
        function (error) {
            v.spinner_notices.articles = "";
            v.displayError("Get URLs Request failed: " + error);
            v.spinStop("getArticles");
        }
      );
      return urls_request;
    },

    /**
     * Get the timeline based on articles
     * @param  {Object}  article_ids The list of article IDs
     * @return {Promise} The timeline is populated with articles
     */
    getTimeline: function(article_ids)
    {
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
          // update the timeline on the next tick because at this point
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
          v.spinStop("getTimeline");
        }
      );
      return timeline_request;
    },

    /**
     * Get the network graph based on articles
     * @param  {Object}  article_ids The list of article IDs
     * @return {Promise} The network graph is populated with info from the articles
     */
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
              var urlString = window.location.hash.toString();
              y.original_query = urlString.substr(1);
              return y;
            });
            // Adding hoaxy edges to memory in case user wants to download the results as csv
            v.hoaxyEdges = edge_list;
            v.graph.updateEdges(edge_list);
            v.updateGraph();
            v.graph.score_stats.reset();
            v.graph.resetBotscores();
            v.graph.setLang(v.lang);
            v.graph.getBotCacheScores();
            v.checkIfShouldDisableAnimation(v.hoaxyEdges);
            v.scrollToElement("secondary_form");
          });
        },
        function (error) {
          var error_message = "";
          if(error.response && error.response.statusText)
          {
            error_message = error.response.statusText;
          }
          else
          {
            error_message = "Unknown error, likely a problem connecting to API server.";
          }

          v.displayError("Get Graph Request failed: " + error_message);
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

    /**
     * Submit feedback on Botometer score
     */
    submitFeedbackForm: function()
    {
      this.feedback_form.display = false;
      var v = this;
      if(!v.twitter_account_info.id)
      {
        v.twitterLogIn()
        .then(function(){
          v.sendFeedbackData();
        }, 
        function(error){
          console.warn(error); 
          v.spinStop(null, true);
        });
      }
      else
      {
        v.sendFeedbackData();
      }
    },

    /**
     * Send data from the user feedback on Botometer \
     * This is in the node modal after updating a score
     */
    sendFeedbackData: function()
    {
        var feedback = {
          source_user_id: this.twitter_account_info.id,
          target_user_id: this.node_modal_content.user_id, 
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
        }, 
        function(error){
          console.debug(error);
        });

        this.feedback_form.type = "";
        this.feedback_form.comment = "";
        console.debug(feedback);
    },

    /**
     * Sets the graph column sizes
     * @param  {Number} x The graph column size
     */
    resizeGraphs: function(x)
    {
      this.graph_column_size = x;
      var v = this;
      Vue.nextTick(function(){
        v.timeline.redraw();
        v.graph.redraw();
      });
    },

    /**
     * Shrink the graph
     */
    shrinkGraph: function()
    {
      this.graph_column_size += 3;
      this.resizeGraphs();
    },

    /**
     * Shrink the timeline
     */
    shrinkTimeline: function()
    {
      this.graph_column_size -= 3;
      this.resizeGraphs();
    },

    /**
     * Starts the animation necessary for tweet timeline playback
     */
    startGraphAnimation: function()
    {
        this.graph.startAnimation();
    },

    /**
     * Stops the tweet timeline playback and resets its cursor to the beginning
     */
    stopGraphAnimation: function()
    {
        this.graph.stopAnimation();
        this.graphAnimation.current_timestamp = 0;
    },

    /**
     * Pauses the tweet timeline playback
     */
    pauseGraphAnimation: function()
    {
        this.graph.pauseAnimation();
    },

    /**
     * Resumes the tweet timeline playback
     */
    unpauseGraphAnimation: function()
    {
        this.graph.unpauseAnimation();
    },

    /**
     * Helper for: 
     * @function logIn()
     * @return  {Promise} Logged in to Twitter
     */
    twitterLogIn: function()
    {
      var me = this.twitter.verifyMe();
      var v = this;
      me.then(
        function(response){
          v.twitter_account_info = response;
          v.profile.image = response.profile_image_url_https;
          v.profile.name = "@" + response.screen_name;
        },
        function(error){
          v.twitter_account_info = {};
          console.warn("error: ", error);
        }
      );
      return me;
    },

    /**
     * Update Botscores button functionality \
     * If logged in, gets up to 20 botscores
     */
    getMoreBotScores: function()
    {
      if(!this.twitter_account_info.id)
      {
        var prom = this.twitterLogIn();
        prom.then( this.graph.getNewScores, function(error){console.warn(error);  v.spinStop(null, true);} );
      }
      else
      {
        this.graph.getNewScores();
      }
    },

    /**
     * Get a single botscore of the user's choosing
     * @param  {String} user_id The twitter user's ID
     */
    getSingleBotScore: function(user_id){
        //console.debug(user_id);
        var v = this;
        this.getting_bot_scores.running = true;
        var success = new Promise(function(resolve, reject){
            if(!v.twitter_account_info.id)
            {
                v.twitterLogIn()
                .then(function(){
                    v.graph.updateUserBotScore({user_id: user_id})
                    .then(resolve, reject);

                },function(error){
                    console.warn(error);
                    reject(error)
                })
            }
            else
            {
                v.graph.updateUserBotScore({user_id: user_id})
                .then(resolve, reject).catch( error =>  console.log(error) );
            }
        });
        success.then(function(response){
            if (response === "Error: rate limit reached") {
              v.twitterRateLimitReachedObj.isReached = true;
              v.getting_bot_scores.running = false;
            } else {
              // Resuming the rate limit as we have successfully
              // retrieved a bot score
              v.twitterRateLimitReachedObj.isReached = false;
              // console.debug(response);
              v.getting_bot_scores.running = false;

              try {
                  var score = 0;
                  if(v.lang == 'en' || v.lang == 'en-gb')
                  {
                    score = response.data.scores.english;
                  }
                  else
                  {
                    score = response.data.scores.universal;
                  }
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
            }
          }, 
          function(){
              v.getting_bot_scores.running = false;
              v.node_modal_content.botscore = -1;
              v.node_modal_content.botcolor = v.graph.getNodeColor(-1);
          })
        },

    /**
     * Helper function for:
     * @function logOut()
     */
    twitterLogOut: function()
    {
      var p = this.twitter.logOut();
      this.twitter_account_info = {};
      this.profile.name = "";
      this.profile.image = defaultProfileImage;
      return p;
    },

    /**
     * Builds JSON Content for downloading JSON/CSV
     * @return {String} The graph edgelist as a JSON string
     */
    buildJSONContent: function()
    {
      var edgeList = {};

      if (this.hoaxyEdges.length > 0) 
      {
        // Creating Hoaxy JSON
        edgeList = this.hoaxyEdges;
      }
      else if (this.twitterEdges.length > 0) 
      {
        // Creating Twitter JSON
        edgeList = this.twitterEdges;
      }

      // Loop iterator
      var numEdges = edgeList.length;
      // Needed to store original_query
      var urlString = window.location.hash.toString();

      let botscores = this.graph.botscores();

      // JSON string
      var dataStr = "";

      var dataArray = [];

      for(var edgeNum = 0; edgeNum < numEdges; edgeNum++)
      {
        let edge = JSON.parse(JSON.stringify(edgeList[edgeNum]));
        // remove # from window.location.hash
        edge.original_query = urlString.substr(1);

        // Botscores must exist to be exported, otherwise undefined error
        // Implied else will export default value of ""
        edge.from_user_botscore = "";
        edge.to_user_botscore = "";
        if((botscores[edgeList[edgeNum].from_user_id]) && (botscores[edgeList[edgeNum].from_user_id].score))
        {
          edge.from_user_botscore = botscores[edgeList[edgeNum].from_user_id].score;
        }
        if((botscores[edgeList[edgeNum].to_user_id]) && (botscores[edgeList[edgeNum].to_user_id].score))
        {
          edge.to_user_botscore = botscores[edgeList[edgeNum].to_user_id].score;
        }

        edge.tweet_url = "";
        if(edgeList[edgeNum]['from_user_screen_name'] && edgeList[edgeNum]['tweet_id'])
        {
          edge.tweet_url = "https://twitter.com/" + String(edgeList[edgeNum]['from_user_screen_name']) + "/status/" + String(edgeList[edgeNum]['tweet_id']);
        }

        dataArray.push(edge);
      }
      dataStr += JSON.stringify(dataArray);

      return dataStr;
    },

    /**
     * Download the graph in JSON format
     * @param  {String} dataStr The JSON-formatted edgelist, typically from buildJSONContent()
     */
    downloadJSON: function(dataStr)
    {
      // Construct download file name
      var rightNow = new Date();
      var rightNowStr = rightNow.getFullYear() + "y." + (rightNow.getMonth()+1) + "m." + rightNow.getDate() + "d_";
      rightNowStr += rightNow.getHours() + "h." + rightNow.getMinutes() + "m." + rightNow.getSeconds() + "s_";
      rightNowStr += rightNow.toTimeString().substr(9);

      var downloadStr = "hoaxy_visualization_" + rightNowStr + ".json";

      // Preparing json file for download
      dataStr =  "data:text/json;charset=iso-639," + dataStr;
      var JSONLink = document.createElement("a");
      JSONLink.setAttribute("href", dataStr);
      JSONLink.setAttribute("download", downloadStr);
      document.body.appendChild(JSONLink);
      
      // File will be downloaded now
      JSONLink.click();
    },

    /**
     * Download the graph in CSV format
     * @param  {String} dataStr The JSON-formatted edgelist, typically from buildJSONContent()
     */
    downloadCSV: function(dataStr)
    {
      // Construct download file name
      var rightNow = new Date();
      var rightNowStr = rightNow.getFullYear() + "y." + (rightNow.getMonth()+1) + "m." + rightNow.getDate() + "d_";
      rightNowStr += rightNow.getHours() + "h." + rightNow.getMinutes() + "m." + rightNow.getSeconds() + "s_";
      rightNowStr += rightNow.toTimeString().substr(9);

      var downloadStr = "hoaxy_visualization_" + rightNowStr + ".csv";

      // Converting JSON to CSV with Papa Parse
      var json = JSON.parse(dataStr); //Papa.parse(dataStr, this.papa_parse_config);
      var csv = Papa.unparse(json, this.papa_unparse_config);

      // Preparing csv file for download
      csv = "data:text/csv;charset=iso-639," + csv;
      csv = encodeURI(csv);
      var CSVLink = document.createElement("a");
      CSVLink.setAttribute("href", csv);
      CSVLink.setAttribute("download", downloadStr);
      document.body.appendChild(CSVLink);
      
      // File will be downloaded now
      CSVLink.click();
    },

    /**
     * Starts the search query to graph building process
     */
    submitForm: function()
    {
      // Resets any results from any previous queries
      this.stopGraphAnimation();
      this.resetTwitterSearchResults();
      this.resetHoaxySearchResults();
      if(this.searchBy == 'Hoaxy') 
      {
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
        var v = this;
        this.globalHoaxyTimeline = new HoaxyTimeline({updateDateRangeCallback: this.updateGraph, graphAnimation: this.graphAnimation});
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
        this.timeline = this.globalHoaxyTimeline;
        // new HoaxyTimeline({updateDateRangeCallback: this.updateGraph, graphAnimation: this.graphAnimation});
        // Adding a url querystring so that user can replicate a query by copy/pasting the url
        this.changeURLParamsHoaxy();
        this.getArticles();
        this.spinStop();
      }
      else if(this.searchBy == 'Twitter') 
      {
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
        var v = this;
        this.globalTwitterSearchTimeline = new TwitterSearchTimeline({updateDateRangeCallback: this.updateGraph, graphAnimation: this.graphAnimation});
        this.globalTwitterSearchTimeline.chart.interactiveLayer.dispatch.on("elementClick", function(e){
          v.pauseGraphAnimation();
          v.graphAnimation.current_timestamp = Math.floor(e.pointXValue);
          v.graphAnimation.increment = 0;
          v.graphAnimation.playing  = true;
          v.graphAnimation.paused = true;
          v.unpauseGraphAnimation();
          v.pauseGraphAnimation();
        });
        this.timeline = this.globalTwitterSearchTimeline;
        // Adding a url querystring so that user can replicate a query by copy/pasting the url
        this.changeURLParamsTwitter();
        var searchUrl = this.attemptToGetUrlHostPath(this.query_text);
        if (searchUrl != null) 
        {
          // If the search query was a URL, run the query through a URL search
          this.getTwitterSearchResults(searchUrl);
        } 
        else 
        {
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

    /**
     * Disable option for tweet timeline playback if there aren't at least 2 dates
     * @param  {Object} edges The edgelist for the network graph
     */
    checkIfShouldDisableAnimation: function(edges) 
    {
      if (edges.length > 0) 
      {
        var localAnimationAvailable = false;
        var pubDate = edges[0]['tweet_created_at'];
        for (var edgeIx = 0; edgeIx < edges.length; edgeIx++) 
        {
          var newPubDate = edges[edgeIx]['tweet_created_at'];
          // There are at least two different dates so we can animate this edge list
          if (newPubDate != pubDate) 
          {
            localAnimationAvailable = true;
            break;
          }
        }
        this.animationAvailable = localAnimationAvailable;
      }
    },

    /**
     * Visualizes a network graph based off of 1 or more selected articles
     * @return  {Boolean} Only in an error case, return false
     */
    visualizeSelectedArticles: function()
    {
      this.show_graphs = false;
      this.show_full_articles_list = false;
      this.$nextTick(function(){
        this.scrollToElement("article_list");
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

    /**
     * Toggle an edge's modal to show more data \
     * Such as which accounts are interacting and in what way
     * @param  {Boolean} force Force a modal to be toggled
     */
    toggleEdgeModal: function(force)
    {
      this.toggleModal("edge", force);
    },

    /**
     * Toggle an node's modal to show more data \
     * Such as which accounts are interacting and in what way
     * @param  {Boolean} force Force a modal to be toggled
     */
    toggleNodeModal: function(force)
    {
      this.toggleModal("node", force);
      this.feedback_form.display = false;
    },

    /**
     * Display an error modal with a message
     * @param  {String} message The error message
     */
    displayError: function(message)
    {
      this.error_message = message;
      this.toggleModal('error', true);
    },

    /**
     * Display an error modal forcibly
     */
    toggleErrorModal: function(force)
    {
      this.toggleModal('error', force);
    },

    /**
     * Toggle the tutorial modal
     * @param  {Boolean} force Force a modal to be toggled
     */
    toggleTutorialModal: function(force)
    {
      this.toggleModal('tutorial', force);
    },

    /**
     * Helper function that toggles visibility of a modal
     * @param  {String}  modal The type of modal to toggle
     * @param  {Boolean} force Force a modal to be toggled
     */
    toggleModal: function(modal, force)
    {
      this.graph.redraw();
      // the timeouts here help with the animation and will need to be adjusted as required
      var prop = "show_" + modal + "_modal";
      var v = this;
      if(!this[prop] || force === true) // show
      {
        this[prop] = true;
        document.getElementsByTagName("body")[0].style.overflowY = "hidden";
        setTimeout(function(){
            v.modal_opacity = true;
        },1);
      }
      else // hide
      {
        this.modal_opacity = false;
        document.getElementsByTagName("body")[0].style.overflowY = "";
        setTimeout(function(){
            v[prop] = false;
        },100);
      }
    },

    /**
     * Show more articles unless the limit has been reached
     */
    loadMore: function()
    {
      if(this.articles_to_show < this.articles.length)
      {
        this.articles_to_show += max_articles;
      }
      else
      {
        this.articles_to_show = max_articles;
      }
    },

    /**
     * Zoom in on the network graph
     */
    zoomInGraph: function()
    {
      this.graph.zoomIn();
    },

    /**
     * Zoom out on the network graph
     */
    zoomOutGraph: function()
    {
      this.graph.zoomOut();
    },

    /**
     * Prepare graph size, timeline, etc. using a function from:
     * @file graph.js
     * @param  {String} starting_time Passed to graph.js.updateGraph()
     * @param  {String} ending_time   Passed to graph.js.updateGraph()
     */
    updateGraph: function(starting_time, ending_time)
    {
      this.graph_column_size = 3;
      if(this.failed_to_get_network)
        return false;

      this.graph.updateGraph(starting_time, ending_time);

      this.show_zoom_buttons = true;
      this.scrollToElement("secondary_form");
    },

    /**
     * Load the Twitter and Facebook share buttons
     */
    loadShareButtons: function()
    {
      try 
      {
        twttr.widgets.load();
      } 
      catch (e) 
      {
        console.warn("error loading twttr widgets", e);
      }

      try 
      {
        FB.XFBML.parse();
      } 
      catch(e) 
      {
        console.warn("error loading facebook widgets", e);
      }
    }
  },
  watch: {
    /**
     * Watches query_sort changes so that it can refocus the search box
     * @member query_sort Sort by relevancy or recency on Hoaxy search
     */
    query_sort: function() 
    {
      this.$refs.searchBox.focus();
    },

    /**
     * Watches twitter_result_type changes so that it can refocus the search box
     * @member twitter_result_type Show recent, relevant, or mixed results
     */
    twitter_result_type: function () 
    {
      // Checking if value is changed and refocusing on the search box
      this.$refs.searchBox.focus();
    },

    /**
     * Updates the timeline's timestamp if the graph's timestamp changes
     */
    "graphAnimation.current_timestamp": function()
    {
      this.timeline.updateTimestamp();
    },

    /**
     * Watches searchBy to switch lang to the default Hoaxy language
     * @member searchBy Searching by Twitter or Hoaxy
     * @member lang The search language
     * @member defaultHoaxyLang The language Hoaxy is deployed in
     */
    "searchBy": function()
    {
      if(this.searchBy == "Hoaxy")
      {
        this.lang = defaultHoaxyLang;
      }
    }
  },

  //  #     #  ####  #    # #    # ##### ###### #####
  //  ##   ## #    # #    # ##   #   #   #      #    #
  //  # # # # #    # #    # # #  #   #   #####  #    #
  //  #  #  # #    # #    # #  # #   #   #      #    #
  //  #     # #    # #    # #   ##   #   #      #    #
  //  #     #  ####   ####  #    #   #   ###### #####
  
  /**
   * Typical Vue beforeMount() function \
   * Ours retrieves the article lists and checks for imported data
   */
  beforeMount: function() 
  {
    // Retrieving popular articles to show them in the dashboard
    this.getPopularArticles();
    // Retrieving top trending articles to show them in the dashboard
    this.getTopUsaArticles();
    
    try
    {
      this.imported_data = JSON.parse(document.getElementById("post_data").innerHTML);
      this.imported_data = JSON.parse(this.imported_data);
    }
    catch(e)
    {
      console.warn("Error with data import. Don't panic.", e);
      if(this.imported_data != "")
      {
        this.visualizeImportedData();
        this.tutorialHideWithCookie();
      }
    }
  },
  /**
   * Typical Vue mounted() function \
   * Ours initializes variables and prepares visualization \
   * if there was an import from BotSlayer
   */
  mounted: function()
  {
    this.mounted = true;
    this.show_articles = false;
    this.show_graphs = false;

    //if there is posted imported data, it should be in an element called "post_data"
    //Can choose to not use JSON.parse to read the string (already comma-sep) to have it POSTed like that
    //this.imported_data = /*JSON.parse(*/document.getElementById("post_data").innerHTML/*)*/;

    //VISUALIZE
    if (this.imported_data != "")
    {
      this.visualizeImportedData();
    }

    //create hourglass loading spinner
    var v = this;
    var f = function(){
      var counter = 0;
      setInterval(function(){
        if(v.loading)
        {
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
      if(key == "lang")
      {
        this.lang = value;
      }
    }

    this.twitter = new Twitter(configuration.twitter_key);
    this.me = this.twitter.me();

    // Callbacks allow for modal manipulation and loading spinner to be handled
    // by Vue.
    this.graph = new HoaxyGraph({
      spinStart: this.spinStart,
      spinStop: this.spinStop,
      toggle_edge_modal: this.toggleEdgeModal,
      toggle_node_modal: this.toggleNodeModal,
      node_modal_content: this.node_modal_content,
      edge_modal_content: this.edge_modal_content,
      getting_bot_scores: this.getting_bot_scores,
      spinner_notices: this.spinner_notices,
      twitter: this.twitter,
      graphAnimation: this.graphAnimation,
      twitterRateLimitReached: this.twitterRateLimitReachedObj
    });

    this.spinStop("initialLoad");

    if(!this.query_text)
    {
      var cookies = document.cookie.split("; ");
      if(cookies.indexOf("HideHoaxyTutorial=true") == -1)
      {
        this.tutorial.show = true;
      }
    }

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
