## `vue-app.js` Functions

<dl>
<dt><a href="#all_selected">all_selected()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Helper function to prepare top 20 articles to be checked</p>
</dd>
<dt><a href="#botscoreCount">botscoreCount()</a> ⇒ <code>Number</code></dt>
<dd><p>Return botscore count within a specified score range  <br>(between 0 and .9, 1 and 1.9, etc.)</p>
</dd>
<dt><a href="#embeddedWidgetCode">embeddedWidgetCode()</a> ⇒ <code>String</code></dt>
<dd><p>Places HTML with Vue variables into a widget modal <br>Contains &quot;Embed&quot; functionality</p>
</dd>
<dt><a href="#searchByDependencyTitle">searchByDependencyTitle()</a> ⇒ <code>String</code></dt>
<dd><p>Decides what the tooltip will say depending <br>on whether it&#39;s searching via Twitter/Hoaxy</p>
</dd>
<dt><a href="#logIn">logIn()</a></dt>
<dd><p>Login to Twitter for connected functionality</p>
</dd>
<dt><a href="#logOut">logOut()</a></dt>
<dd><p>Logout of Twitter</p>
</dd>
<dt><a href="#fileUploadHandler">fileUploadHandler(evt)</a></dt>
<dd><p>Prepares uploaded file for visualization import</p>
</dd>
<dt><a href="#parseCSV">parseCSV(csv_string)</a> ⇒ <code>Object</code></dt>
<dd><p>Parse the imported CSV to prep for visualization</p>
</dd>
<dt><a href="#visualizeImportedData">visualizeImportedData()</a></dt>
<dd><p>Visualize the imported .CSV or .JSON file</p>
</dd>
<dt><a href="#selectTop20">selectTop20()</a></dt>
<dd><p>Selects the top 20 articles to prep for visualization</p>
</dd>
<dt><a href="#tutorialNextSlide">tutorialNextSlide()</a></dt>
<dd><p>Move to the next tutorial slide <br>and keep an index of the current slide</p>
</dd>
<dt><a href="#tutorialPreviousSlide">tutorialPreviousSlide()</a></dt>
<dd><p>Move to the previous tutorial slide <br>and keep an index of the current slide</p>
</dd>
<dt><a href="#tutorialGotoSlide">tutorialGotoSlide()</a></dt>
<dd><p>Move to a specific tutorial slide</p>
</dd>
<dt><a href="#tutorialHide">tutorialHide()</a></dt>
<dd><p>Hide the tutorial</p>
</dd>
<dt><a href="#tutorialHideWithCookie">tutorialHideWithCookie()</a></dt>
<dd><p>Hide the tutorial and make sure it does not show up next visit</p>
</dd>
<dt><a href="#hoverTooltip">hoverTooltip(e)</a></dt>
<dd><p>Custom hover tooltip showing functionality</p>
</dd>
<dt><a href="#hideTooltip">hideTooltip(e)</a></dt>
<dd><p>Custom hover tooltip hiding functionality</p>
</dd>
<dt><a href="#filterNodesByScore">filterNodesByScore(min, max)</a></dt>
<dd><p>Only color nodes within a score range</p>
</dd>
<dt><a href="#twitterSearch">twitterSearch()</a></dt>
<dd><p>Used to set variables to handle a Twitter search</p>
</dd>
<dt><a href="#hoaxySearch">hoaxySearch()</a></dt>
<dd><p>Used to set variables to handle a Hoaxy search</p>
</dd>
<dt><a href="#initializeHoaxyTimeline">initializeHoaxyTimeline()</a></dt>
<dd><p>Prepares the graph for visualization</p>
</dd>
<dt><a href="#initializeTwitterTimeline">initializeTwitterTimeline()</a></dt>
<dd><p>Prepares the graph for visualization</p>
</dd>
<dt><a href="#formatTime">formatTime(time)</a> ⇒ <code>String</code></dt>
<dd><p>Formats time to &#39;MMM D YYYY h:mm a&#39; format</p>
</dd>
<dt><a href="#stripWwwIfPresent">stripWwwIfPresent(url)</a> ⇒ <code>String</code></dt>
<dd><p>Strips a url of &#39;www.&#39;</p>
</dd>
<dt><a href="#prepareAndShowWidgetCode">prepareAndShowWidgetCode()</a></dt>
<dd><p>Prepares the embed screenshot and widget modal</p>
</dd>
<dt><a href="#copyWidgetCodeToClipboard">copyWidgetCodeToClipboard()</a></dt>
<dd><p>Copies the html embed widget to the user&#39;s clipboard</p>
</dd>
<dt><a href="#resetWidgetContent">resetWidgetContent()</a></dt>
<dd><p>Hides the html embed widget modal <br>and sets copiedWidgetText flag to false</p>
</dd>
<dt><a href="#focusSearchBox">focusSearchBox()</a></dt>
<dd><p>If the search box is focused, enable searching</p>
</dd>
<dt><a href="#formatArticleType">formatArticleType(type)</a> ⇒ <code>String</code></dt>
<dd><p>Stringifies the article type</p>
</dd>
<dt><a href="#shortenArticleText">shortenArticleText(text, text_length)</a> ⇒ <code>String</code></dt>
<dd><p>Truncates article text with an added elipses.</p>
</dd>
<dt><a href="#getTopUsaArticles">getTopUsaArticles()</a></dt>
<dd><p>Retrieve the top 3 articles for &quot;Trending News&quot;</p>
</dd>
<dt><a href="#getPopularArticles">getPopularArticles()</a></dt>
<dd><p>Retrieve the top 3 &quot;Popular Claims&quot; and &quot;Popular Fact-Checks&quot;</p>
</dd>
<dt><a href="#getSubsetOfArticles">getSubsetOfArticles()</a></dt>
<dd><p>Gets a subset of articles up to @articles_to_show</p>
</dd>
<dt><a href="#getDateline">getDateline(url_pub_date)</a> ⇒ <code>String</code></dt>
<dd><p>Formats the date published field of an article to: <br>&#39;MMM D, YYYY&#39; with moment</p>
</dd>
<dt><a href="#attemptToGetUrlHostName">attemptToGetUrlHostName(url)</a> ⇒ <code>String</code></dt>
<dd><p>Extracts the hostname of the URL, if possible</p>
</dd>
<dt><a href="#attemptToGetUrlHostPath">attemptToGetUrlHostPath(url)</a> ⇒ <code>String</code></dt>
<dd><p>Extracts the article path of the URL, if possible</p>
</dd>
<dt><a href="#getOffset">getOffset(element)</a> ⇒ <code>Object</code></dt>
<dd><p>Get the offset of an HTML element (specifically used for the graph)</p>
</dd>
<dt><a href="#scrollToElement">scrollToElement(id)</a></dt>
<dd><p>Scroll the window to the element (specifically the graph)</p>
</dd>
<dt><a href="#directSearchDashboard">directSearchDashboard(article, dashSource)</a></dt>
<dd><p>Directly searches if clicking &quot;Search Link&quot; icon or &quot;Search Title&quot;</p>
</dd>
<dt><a href="#changeAndFocusSearchQuery">changeAndFocusSearchQuery(article, dashSource)</a></dt>
<dd><p>Auto-selects Hoaxy or Twitter search and focuses the searchbox</p>
</dd>
<dt><a href="#changeURLParamsHoaxy">changeURLParamsHoaxy()</a> ⇒ <code>String</code></dt>
<dd><p>Sets the URL parameters if searching by Hoaxy</p>
</dd>
<dt><a href="#changeURLParamsTwitter">changeURLParamsTwitter()</a> ⇒ <code>String</code></dt>
<dd><p>Sets the URL parameters if searching by Twitter</p>
</dd>
<dt><a href="#spinStop">spinStop(key, reset)</a></dt>
<dd><p>Stops the loading spinner</p>
</dd>
<dt><a href="#spinStart">spinStart(key)</a></dt>
<dd><p>Start the loading spinner</p>
</dd>
<dt><a href="#formatDate">formatDate(unFormattedDate)</a> ⇒ <code>String</code></dt>
<dd><p>Formats the date for the timeline</p>
</dd>
<dt><a href="#sortDates">sortDates(dateOne, dateTwo)</a> ⇒ <code>Number</code></dt>
<dd><p>Determine which date is first, or if they&#39;re the same date</p>
</dd>
<dt><a href="#createTwitterDateBins">createTwitterDateBins(dates)</a></dt>
<dd><p>Create the points in time to check number of tweets</p>
</dd>
<dt><a href="#resetTwitterSearchResults">resetTwitterSearchResults()</a></dt>
<dd><p>Clear out graph details related to Twitter search</p>
</dd>
<dt><a href="#resetHoaxySearchResults">resetHoaxySearchResults()</a></dt>
<dd><p>Clear out graph details related to Hoaxy search</p>
</dd>
<dt><a href="#buildTwitterEdgesTimeline">buildTwitterEdgesTimeline(twitterEntities)</a></dt>
<dd><p>Build Twitter Timeline and Edges: <br>Prepares the timeline and graph to be displayed</p>
</dd>
<dt><a href="#buildTwitterGraph">buildTwitterGraph(dont_reset)</a></dt>
<dd><p>Visualizes the graph with data gathered in buildTwitterEdgesTimeline()</p>
</dd>
<dt><a href="#getTwitterSearchResults">getTwitterSearchResults(query)</a></dt>
<dd><p>Get Twitter search results</p>
</dd>
<dt><a href="#getArticles">getArticles()</a> ⇒ <code>Promise</code></dt>
<dd><p>Get articles from database</p>
</dd>
<dt><a href="#getTimeline">getTimeline(article_ids)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get the timeline based on articles</p>
</dd>
<dt><a href="#getNetwork">getNetwork(article_ids)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get the network graph based on articles</p>
</dd>
<dt><a href="#submitFeedbackForm">submitFeedbackForm()</a></dt>
<dd><p>Submit feedback on Botometer score</p>
</dd>
<dt><a href="#sendFeedbackData">sendFeedbackData()</a></dt>
<dd><p>Send data from the user feedback on Botometer <br>This is in the node modal after updating a score</p>
</dd>
<dt><a href="#resizeGraphs">resizeGraphs(x)</a></dt>
<dd><p>Sets the graph column sizes</p>
</dd>
<dt><a href="#shrinkGraph">shrinkGraph()</a></dt>
<dd><p>Shrink the graph</p>
</dd>
<dt><a href="#shrinkTimeline">shrinkTimeline()</a></dt>
<dd><p>Shrink the timeline</p>
</dd>
<dt><a href="#startGraphAnimation">startGraphAnimation()</a></dt>
<dd><p>Starts the animation necessary for tweet timeline playback</p>
</dd>
<dt><a href="#stopGraphAnimation">stopGraphAnimation()</a></dt>
<dd><p>Stops the tweet timeline playback and resets its cursor to the beginning</p>
</dd>
<dt><a href="#pauseGraphAnimation">pauseGraphAnimation()</a></dt>
<dd><p>Pauses the tweet timeline playback</p>
</dd>
<dt><a href="#unpauseGraphAnimation">unpauseGraphAnimation()</a></dt>
<dd><p>Resumes the tweet timeline playback</p>
</dd>
<dt><a href="#logIn_new">logIn()()</a> ⇒ <code>Promise</code></dt>
<dd><p>Helper for:</p>
</dd>
<dt><a href="#getMoreBotScores">getMoreBotScores()</a></dt>
<dd><p>Update Botscores button functionality <br>If logged in, gets up to 20 botscores</p>
</dd>
<dt><a href="#getSingleBotScore">getSingleBotScore(user_id)</a></dt>
<dd><p>Get a single botscore of the user&#39;s choosing</p>
</dd>
<dt><a href="#logOut_new">logOut()()</a></dt>
<dd><p>Helper function for:</p>
</dd>
<dt><a href="#buildJSONContent">buildJSONContent()</a> ⇒ <code>String</code></dt>
<dd><p>Builds JSON Content for downloading JSON/CSV</p>
</dd>
<dt><a href="#downloadJSON">downloadJSON(dataStr)</a></dt>
<dd><p>Download the graph in JSON format</p>
</dd>
<dt><a href="#downloadCSV">downloadCSV(dataStr)</a></dt>
<dd><p>Download the graph in CSV format</p>
</dd>
<dt><a href="#submitForm">submitForm()</a></dt>
<dd><p>Starts the search query to graph building process</p>
</dd>
<dt><a href="#checkIfShouldDisableAnimation">checkIfShouldDisableAnimation(edges)</a></dt>
<dd><p>Disable option for tweet timeline playback if there aren&#39;t at least 2 dates</p>
</dd>
<dt><a href="#visualizeSelectedArticles">visualizeSelectedArticles()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Visualizes a network graph based off of 1 or more selected articles</p>
</dd>
<dt><a href="#toggleEdgeModal">toggleEdgeModal(force)</a></dt>
<dd><p>Toggle an edge&#39;s modal to show more data <br>Such as which accounts are interacting and in what way</p>
</dd>
<dt><a href="#toggleNodeModal">toggleNodeModal(force)</a></dt>
<dd><p>Toggle an node&#39;s modal to show more data <br>Such as which accounts are interacting and in what way</p>
</dd>
<dt><a href="#displayError">displayError(message)</a></dt>
<dd><p>Display an error modal with a message</p>
</dd>
<dt><a href="#toggleErrorModal">toggleErrorModal()</a></dt>
<dd><p>Display an error modal forcibly</p>
</dd>
<dt><a href="#toggleTutorialModal">toggleTutorialModal(force)</a></dt>
<dd><p>Toggle the tutorial modal</p>
</dd>
<dt><a href="#toggleModal">toggleModal(modal, force)</a></dt>
<dd><p>Helper function that toggles visibility of a modal</p>
</dd>
<dt><a href="#loadMore">loadMore()</a></dt>
<dd><p>Show more articles unless the limit has been reached</p>
</dd>
<dt><a href="#zoomInGraph">zoomInGraph()</a></dt>
<dd><p>Zoom in on the network graph</p>
</dd>
<dt><a href="#zoomOutGraph">zoomOutGraph()</a></dt>
<dd><p>Zoom out on the network graph</p>
</dd>
<dt><a href="#loadShareButtons">loadShareButtons()</a></dt>
<dd><p>Load the Twitter and Facebook share buttons</p>
</dd>
<dt><a href="#beforeMount">beforeMount()</a></dt>
<dd><p>Typical Vue beforeMount() function <br>Ours retrieves the article lists and checks for imported data</p>
</dd>
<dt><a href="#mounted">mounted()</a></dt>
<dd><p>Typical Vue mounted() function <br>Ours initializes variables and prepares visualization <br>if there was an import from BotSlayer</p>
</dd>
</dl>

<a name="query_sort"></a>

## query\_sort
Watches query_sort changes so that it can refocus the search box

<a name="twitter_result_type"></a>

## twitter\_result\_type
Watches twitter_result_type changes so that it can refocus the search box

<a name="defaultHoaxyLang"></a>

## defaultHoaxyLang
Watches `searchBy` to switch `lang` to the default Hoaxy language
  
<a name="all_selected"></a>

## all\_selected() ⇒ <code>Boolean</code>
Helper function to prepare top 20 articles to be checked

**Returns**: <code>Boolean</code> - Whether there are 20 checked articles or not  
<a name="botscoreCount"></a>

## botscoreCount() ⇒ <code>Number</code>
Return botscore count within a specified score range  \
(between 0 and .9, 1 and 1.9, etc.)

**Returns**: <code>Number</code> - The number of botscores in the range  
<a name="embeddedWidgetCode"></a>

## embeddedWidgetCode() ⇒ <code>String</code>
Places HTML with Vue variables into a widget modal \
Contains "Embed" functionality

**Returns**: <code>String</code> - HTML that will create the "Embed" widget modal  
<a name="searchByDependencyTitle"></a>

## searchByDependencyTitle() ⇒ <code>String</code>
Decides what the tooltip will say depending \
on whether it's searching via Twitter/Hoaxy
 
**Returns**: <code>String</code> - The tooltip's text  
<a name="logIn"></a>

## logIn()
Login to Twitter for connected functionality

<a name="logOut"></a>

## logOut()
Logout of Twitter

<a name="fileUploadHandler"></a>

## fileUploadHandler(evt)
Prepares uploaded file for visualization import


| Param | Type | Description |
| --- | --- | --- |
| evt | <code>Object</code> | The file upload event |

<a name="parseCSV"></a>

## parseCSV(csv_string) ⇒ <code>Object</code>
Parse the imported CSV to prep for visualization
 
**Returns**: <code>Object</code> - The object containing the rows of data  

| Param | Type | Description |
| --- | --- | --- |
| csv_string | <code>String</code> | The imported .CSV file |

<a name="visualizeImportedData"></a>

## visualizeImportedData()
Visualize the imported .CSV or .JSON file

<a name="selectTop20"></a>

## selectTop20()
Selects the top 20 articles to prep for visualization
 
<a name="tutorialNextSlide"></a>

## tutorialNextSlide()
Move to the next tutorial slide \
and keep an index of the current slide

<a name="tutorialPreviousSlide"></a>

## tutorialPreviousSlide()
Move to the previous tutorial slide \
and keep an index of the current slide

<a name="tutorialGotoSlide"></a>

## tutorialGotoSlide()
Move to a specific tutorial slide
 
<a name="tutorialHide"></a>

## tutorialHide()
Hide the tutorial

<a name="tutorialHideWithCookie"></a>

## tutorialHideWithCookie()
Hide the tutorial and make sure it does not show up next visit
 
<a name="hoverTooltip"></a>

## hoverTooltip(e)
Custom hover tooltip showing functionality
 
**Todo**

- [ ] Replace with Bootstrap-Vue

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Object</code> | the mouse hover event |

<a name="hideTooltip"></a>

## hideTooltip(e)
Custom hover tooltip hiding functionality

**Todo**

- [ ] Replace with Bootstrap-Vue

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Object</code> | the mouse hover event |

<a name="filterNodesByScore"></a>

## filterNodesByScore(min, max)
Only color nodes within a score range

| Param | Type | Description |
| --- | --- | --- |
| min | <code>Number</code> | bottom of the score range |
| max | <code>Number</code> | top of the score range |

<a name="twitterSearch"></a>

## twitterSearch()
Used to set variables to handle a Twitter search

<a name="hoaxySearch"></a>

## hoaxySearch()
Used to set variables to handle a Hoaxy search

<a name="initializeHoaxyTimeline"></a>

## initializeHoaxyTimeline()
Prepares the graph for visualization

**Todo**

- [ ] Check for redundant code

<a name="initializeTwitterTimeline"></a>

## initializeTwitterTimeline()
Prepares the graph for visualization

**Todo**

- [ ] Check for redundant code

<a name="formatTime"></a>

## formatTime(time) ⇒ <code>String</code>
Formats time to 'MMM D YYYY h:mm a' format

**Returns**: <code>String</code> - The formatted time  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>String</code> | The timestamp from the node modal |

<a name="stripWwwIfPresent"></a>

## stripWwwIfPresent(url) ⇒ <code>String</code>
Strips a url of 'www.'

**Returns**: <code>String</code> - The formatted url without 'www.'  

| Param | Type |
| --- | --- |
| url | <code>String</code> | 

<a name="prepareAndShowWidgetCode"></a>

## prepareAndShowWidgetCode()
Prepares the embed screenshot and widget modal

<a name="copyWidgetCodeToClipboard"></a>

## copyWidgetCodeToClipboard()
Copies the html embed widget to the user's clipboard

<a name="resetWidgetContent"></a>

## resetWidgetContent()
Hides the html embed widget modal \
and sets copiedWidgetText flag to false

<a name="focusSearchBox"></a>

## focusSearchBox()
If the search box is focused, enable searching
 
<a name="formatArticleType"></a>

## formatArticleType(type) ⇒ <code>String</code>
Stringifies the article type

**Returns**: <code>String</code> - The extended string representing the article type  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | The type of the article |

<a name="shortenArticleText"></a>

## shortenArticleText(text, text_length) ⇒ <code>String</code>
Truncates article text with an added elipses.

**Returns**: <code>String</code> - The truncated text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>String</code> | The text from the headline of the article |
| text_length | <code>Number</code> | The desired length to truncate to |

<a name="getTopUsaArticles"></a>

## getTopUsaArticles()
Retrieve the top 3 articles for "Trending News"

<a name="getPopularArticles"></a>

## getPopularArticles()
Retrieve the top 3 "Popular Claims" and "Popular Fact-Checks"

<a name="getSubsetOfArticles"></a>

## getSubsetOfArticles()
Gets a subset of articles up to @articles_to_show

<a name="getDateline"></a>

## getDateline(url_pub_date) ⇒ <code>String</code>
Formats the date published field of an article to: \
'MMM D, YYYY' with moment

**Returns**: <code>String</code> - The formatted date published  

| Param | Type | Description |
| --- | --- | --- |
| url_pub_date | <code>String</code> | The date the article was published |

<a name="attemptToGetUrlHostName"></a>

## attemptToGetUrlHostName(url) ⇒ <code>String</code>
Extracts the hostname of the URL, if possible

**Returns**: <code>String</code> - The hostname of the article link  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The article link |

<a name="attemptToGetUrlHostPath"></a>

## attemptToGetUrlHostPath(url) ⇒ <code>String</code>
Extracts the article path of the URL, if possible

**Returns**: <code>String</code> - The full path to the article  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The article link |

<a name="getOffset"></a>

## getOffset(element) ⇒ <code>Object</code>
Get the offset of an HTML element (specifically used for the graph)

**Returns**: <code>Object</code> - The offset of the element  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>Object</code> | The HTML element to check |

<a name="scrollToElement"></a>

## scrollToElement(id)
Scroll the window to the element (specifically the graph) 

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the element |

<a name="directSearchDashboard"></a>

## directSearchDashboard(article, dashSource)
Directly searches if clicking "Search Link" icon or "Search Title"

| Param | Type | Description |
| --- | --- | --- |
| article | <code>String</code> | The article title/link clicked to search Hoaxy for |
| dashSource | <code>String</code> | The section of the dashboard the article was under |

<a name="changeAndFocusSearchQuery"></a>

## changeAndFocusSearchQuery(article, dashSource)
Auto-selects Hoaxy or Twitter search and focuses the searchbox

| Param | Type | Description |
| --- | --- | --- |
| article | <code>String</code> | The title/link of the article |
| dashSource | <code>String</code> | The section of the dashboard the article was under |

<a name="changeURLParamsHoaxy"></a>

## changeURLParamsHoaxy() ⇒ <code>String</code>
Sets the URL parameters if searching by Hoaxy

**Returns**: <code>String</code> - The full query string (to be appended after #)  
**Todo**

- [ ] Consider refactoring this and changeURLParamsTwitter() into 1 function

<a name="changeURLParamsTwitter"></a>

## changeURLParamsTwitter() ⇒ <code>String</code>
Sets the URL parameters if searching by Twitter

**Returns**: <code>String</code> - The full query string (to be appended after #)  
**Todo**

- [ ] Consider refactoring this and changeURLParamsHoaxy() into 1 function

<a name="spinStop"></a>

## spinStop(key, reset)
Stops the loading spinner 

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The key of the function in the spin_key_table |
| reset | <code>Boolean</code> | Whether to reset the spinner timeout |

<a name="spinStart"></a>

## spinStart(key)
Start the loading spinner

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The key of the function in the spin_key_table |

<a name="formatDate"></a>

## formatDate(unFormattedDate) ⇒ <code>String</code>
Formats the date for the timeline
 
**Returns**: <code>String</code> - The date formatted to 'MM/DD/YYYY hh:mm:ss AM/PM'  

| Param | Type | Description |
| --- | --- | --- |
| unFormattedDate | <code>String</code> | The incoming date |

<a name="sortDates"></a>

## sortDates(dateOne, dateTwo) ⇒ <code>Number</code>
Determine which date is first, or if they're the same date
 
**Returns**: <code>Number</code> - dateOne is 1: greater than, -1: less than, 0: equal to dateTwo  

| Param | Type | Description |
| --- | --- | --- |
| dateOne | <code>String</code> | The first date |
| dateTwo | <code>String</code> | The second date |

<a name="createTwitterDateBins"></a>

## createTwitterDateBins(dates)
Create the points in time to check number of tweets

| Param | Type | Description |
| --- | --- | --- |
| dates | <code>Array.&lt;Object&gt;</code> | The dates where tweets occurred |

<a name="resetTwitterSearchResults"></a>

## resetTwitterSearchResults()
Clear out graph details related to Twitter search
 
<a name="resetHoaxySearchResults"></a>

## resetHoaxySearchResults()
Clear out graph details related to Hoaxy search
  
<a name="buildTwitterEdgesTimeline"></a>

## buildTwitterEdgesTimeline(twitterEntities)
Build Twitter Timeline and Edges: \
Prepares the timeline and graph to be displayed
  
**Todo**

- [ ] Deeply inspect this function and buildTwitterGraph() \
There may be ways to refactor/remove code

| Param | Type |
| --- | --- |
| twitterEntities | <code>Object</code> | 

<a name="buildTwitterGraph"></a>

## buildTwitterGraph(dont_reset)
Visualizes the graph with data gathered in buildTwitterEdgesTimeline()

| Param | Type | Description |
| --- | --- | --- |
| dont_reset | <code>Boolean</code> | If true, doesn't reset botscores, cache, or language |

<a name="getTwitterSearchResults"></a>

## getTwitterSearchResults(query)
Get Twitter search results

| Param | Type | Description |
| --- | --- | --- |
| query | <code>String</code> | What to search on Twitter |

<a name="getArticles"></a>

## getArticles() ⇒ <code>Promise</code>
Get articles from database

**Returns**: <code>Promise</code> - The articles asked for  
<a name="getTimeline"></a>

## getTimeline(article_ids) ⇒ <code>Promise</code>
Get the timeline based on articles

**Returns**: <code>Promise</code> - The timeline is populated with articles  

| Param | Type | Description |
| --- | --- | --- |
| article_ids | <code>Object</code> | The list of article IDs |

<a name="getNetwork"></a>

## getNetwork(article_ids) ⇒ <code>Promise</code>
Get the network graph based on articles

**Returns**: <code>Promise</code> - The network graph is populated with info from the articles  

| Param | Type | Description |
| --- | --- | --- |
| article_ids | <code>Object</code> | The list of article IDs |

<a name="submitFeedbackForm"></a>

## submitFeedbackForm()
Submit feedback on Botometer score

<a name="sendFeedbackData"></a>

## sendFeedbackData()
Send data from the user feedback on Botometer \
This is in the node modal after updating a score

<a name="resizeGraphs"></a>

## resizeGraphs(x)
Sets the graph column sizes 

| Param | Type | Description |
| --- | --- | --- |
| x | <code>Number</code> | The graph column size |

<a name="shrinkGraph"></a>

## shrinkGraph()
Shrink the graph

<a name="shrinkTimeline"></a>

## shrinkTimeline()
Shrink the timeline

<a name="startGraphAnimation"></a>

## startGraphAnimation()
Starts the animation necessary for tweet timeline playback
 
<a name="stopGraphAnimation"></a>

## stopGraphAnimation()
Stops the tweet timeline playback and resets its cursor to the beginning

<a name="pauseGraphAnimation"></a>

## pauseGraphAnimation()
Pauses the tweet timeline playback
 
<a name="unpauseGraphAnimation"></a>

## unpauseGraphAnimation()
Resumes the tweet timeline playback

<a name="logIn_new"></a>

## logIn()() ⇒ <code>Promise</code>
Helper for:

**Returns**: <code>Promise</code> - Logged in to Twitter  
<a name="getMoreBotScores"></a>

## getMoreBotScores()
Update Botscores button functionality \
If logged in, gets up to 20 botscores

<a name="getSingleBotScore"></a>

## getSingleBotScore(user_id)
Get a single botscore of the user's choosing

| Param | Type | Description |
| --- | --- | --- |
| user_id | <code>String</code> | The twitter user's ID |

<a name="logOut_new"></a>

## logOut()()
Helper function for:
 
<a name="buildJSONContent"></a>

## buildJSONContent() ⇒ <code>String</code>
Builds JSON Content for downloading JSON/CSV
 
**Returns**: <code>String</code> - The graph edgelist as a JSON string  
<a name="downloadJSON"></a>

## downloadJSON(dataStr)
Download the graph in JSON format

| Param | Type | Description |
| --- | --- | --- |
| dataStr | <code>String</code> | The JSON-formatted edgelist, typically from buildJSONContent() |

<a name="downloadCSV"></a>

## downloadCSV(dataStr)
Download the graph in CSV format

| Param | Type | Description |
| --- | --- | --- |
| dataStr | <code>String</code> | The JSON-formatted edgelist, typically from buildJSONContent() |

<a name="submitForm"></a>

## submitForm()
Starts the search query to graph building process
  
<a name="checkIfShouldDisableAnimation"></a>

## checkIfShouldDisableAnimation(edges)
Disable option for tweet timeline playback if there aren't at least 2 dates

| Param | Type | Description |
| --- | --- | --- |
| edges | <code>Object</code> | The edgelist for the network graph |

<a name="visualizeSelectedArticles"></a>

## visualizeSelectedArticles() ⇒ <code>Boolean</code>
Visualizes a network graph based off of 1 or more selected articles

**Returns**: <code>Boolean</code> - Only in an error case, return false  
<a name="toggleEdgeModal"></a>

## toggleEdgeModal(force)
Toggle an edge's modal to show more data \
Such as which accounts are interacting and in what way

| Param | Type | Description |
| --- | --- | --- |
| force | <code>Boolean</code> | Force a modal to be toggled |

<a name="toggleNodeModal"></a>

## toggleNodeModal(force)
Toggle an node's modal to show more data \
Such as which accounts are interacting and in what way

| Param | Type | Description |
| --- | --- | --- |
| force | <code>Boolean</code> | Force a modal to be toggled |

<a name="displayError"></a>

## displayError(message)
Display an error modal with a message

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | The error message |

<a name="toggleErrorModal"></a>

## toggleErrorModal()
Display an error modal forcibly

<a name="toggleTutorialModal"></a>

## toggleTutorialModal(force)
Toggle the tutorial modal

| Param | Type | Description |
| --- | --- | --- |
| force | <code>Boolean</code> | Force a modal to be toggled |

<a name="toggleModal"></a>

## toggleModal(modal, force)
Helper function that toggles visibility of a modal

| Param | Type | Description |
| --- | --- | --- |
| modal | <code>String</code> | The type of modal to toggle |
| force | <code>Boolean</code> | Force a modal to be toggled |

<a name="loadMore"></a>

## loadMore()
Show more articles unless the limit has been reached

<a name="zoomInGraph"></a>

## zoomInGraph()
Zoom in on the network graph

<a name="zoomOutGraph"></a>

## zoomOutGraph()
Zoom out on the network graph

<a name="loadShareButtons"></a>

## loadShareButtons()
Load the Twitter and Facebook share buttons

<a name="beforeMount"></a>

## beforeMount()
Typical Vue beforeMount() function \
Ours retrieves the article lists and checks for imported data

<a name="mounted"></a>

## mounted()
Typical Vue mounted() function \
Ours initializes variables and prepares visualization \
if there was an import from BotSlayer
