## `graph.js` Functions

<dl>
<dt><a href="#UpdateEdges">UpdateEdges(newEdges)</a> ⇒ <code>Array.&lt;Object&gt;</code></dt>
<dd><p>Update edges on the graph</p>
</dd>
<dt><a href="#setBotScore">setBotScore(importedID, importedBotscore)</a></dt>
<dd><p>Handles imported bot scores from CSV/JSON</p>
</dd>
<dt><a href="#getBotCacheScores">getBotCacheScores()</a></dt>
<dd><p>Get bot scores from the cache url specified in `config.js`</p>
</dd>
<dt><a href="#getNewScores">getNewScores()</a></dt>
<dd><p>Get fresh bot scores, 20 per batch</p>
</dd>
<dt><a href="#getBotScoreTimer">getBotScoreTimer(index)</a> ⇒ <code>Boolean</code> | <code>function</code></dt>
<dd><p>Gets a new botscore every second to avoid quickly hitting the rate limit</p>
</dd>
<dt><a href="#updateUserBotScore">updateUserBotScore(user)</a> ⇒ <code>Promise</code></dt>
<dd><p>Update an individual, specific user&#39;s botscore</p>
</dd>
<dt><a href="#twitterResponseFail">twitterResponseFail(error)</a></dt>
<dd><p>If the twitter promise in getNewBotometerScore fails,
warn in the console with a detailed error.</p>
</dd>
<dt><a href="#getNewBotometerScore">getNewBotometerScore(user_id)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get individual scores from Botometer based on user_id</p>
</dd>
<dt><a href="#getBotScore">getBotScore(user_object, potentially_old_sn)</a> ⇒ <code>Number</code></dt>
<dd><p>Get the botscore (and maybe fresh screenname) of the user</p>
</dd>
<dt><a href="#refreshGraph">refreshGraph()</a></dt>
<dd><p>Refresh the graph no more than 30 times per second</p>
</dd>
<dt><a href="#updateNodeColor">updateNodeColor(node_id, score)</a></dt>
<dd><p>Update an individual node&#39;s color</p>
</dd>
<dt><a href="#getBaseColor">getBaseColor(score)</a> ⇒ <code>Object</code></dt>
<dd><p>Set up base colors to allow for calling r, g, b of color  <br>Helper function for getNodeColor() and getBorderColor()</p>
</dd>
<dt><a href="#getRenderer">getRenderer()</a> ⇒ <code>Object</code></dt>
<dd><p>Used to take a snapshot of the graph</p>
</dd>
<dt><a href="#getNodeColor">getNodeColor(score)</a> ⇒ <code>Object</code></dt>
<dd><p>Get the node&#39;s color based on botscore</p>
</dd>
<dt><a href="#getBorderColor">getBorderColor(score)</a> ⇒ <code>Object</code></dt>
<dd><p>Get the node&#39;s border&#39;s color</p>
</dd>
<dt><a href="#KillGraph">KillGraph()</a></dt>
<dd><p>Removes all information from the graph to start over</p>
</dd>
<dt><a href="#UpdateGraph">UpdateGraph(start_time, end_time)</a></dt>
<dd><p>Create the graph</p>
</dd>
<dt><a href="#GenerateUserModal">GenerateUserModal(e)</a></dt>
<dd><p>Generates the modal that pops up when clicking on a node</p>
</dd>
<dt><a href="#drawGraph">drawGraph()</a></dt>
<dd><p>Draws the Sigma graph</p>
</dd>
<dt><a href="#zoomIn">zoomIn()</a></dt>
<dd><p>Zoom in on the graph</p>
</dd>
<dt><a href="#zoomOut">zoomOut()</a></dt>
<dd><p>Zoom out on the graph</p>
</dd>
<dt><a href="#redraw">redraw()</a></dt>
<dd><p>Draw the graph</p>
</dd>
<dt><a href="#FilterEdges">FilterEdges(filterTimestamp)</a></dt>
<dd><p>Filter edges shown based on timestamp window chosen in timeline</p>
</dd>
<dt><a href="#AnimateFilter">AnimateFilter(timestamp)</a></dt>
<dd><p>Animates graph from beginning to end (or paused location to end)</p>
</dd>
<dt><a href="#StartAnimation">StartAnimation()</a></dt>
<dd><p>Start the graph animation (show tweets as they happened)</p>
</dd>
<dt><a href="#StopAnimation">StopAnimation()</a></dt>
<dd><p>Stop the graph animation and show all nodes and edges again</p>
</dd>
<dt><a href="#PauseAnimation">PauseAnimation()</a></dt>
<dd><p>Pause the graph animation</p>
</dd>
<dt><a href="#UnpauseAnimation">UnpauseAnimation()</a></dt>
<dd><p>Resume the graph animation from a paused state</p>
</dd>
<dt><a href="#filterNodesByScore">filterNodesByScore(max, min)</a></dt>
<dd><p>Filter nodes by botscore (e.g. between 3.0 and 4.0)</p>
</dd>
</dl>

<a name="UpdateEdges"></a>

## UpdateEdges(newEdges) ⇒ <code>Array.&lt;Object&gt;</code>
Update edges on the graph

**Returns**: <code>Array.&lt;Object&gt;</code> - The edges that are on the graph at the end of the function  

| Param | Type | Description |
| --- | --- | --- |
| newEdges | <code>Array.&lt;Object&gt;</code> | The edges to be placed on the graph |

<a name="setBotScore"></a>

## setBotScore(importedID, importedBotscore)
Handles imported bot scores from CSV/JSON


| Param | Type | Description |
| --- | --- | --- |
| importedID | <code>String</code> | The imported ID of the user |
| importedBotscore | <code>Number</code> | The imported botscore of the user |

<a name="getBotCacheScores"></a>

## getBotCacheScores()
Get bot scores from the cache url specified in `config.js`

<a name="getNewScores"></a>

## getNewScores()
Get fresh bot scores, 20 per batch

<a name="getBotScoreTimer"></a>

## getBotScoreTimer(index) ⇒ <code>Boolean</code> \| <code>function</code>
Gets a new botscore every second to avoid quickly hitting the rate limit

**Returns**: <code>Boolean</code> \| <code>function</code> - Returns setTimeout(), or false if no scores left  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | The index for the botscores; avoids repeat score queries |

<a name="updateUserBotScore"></a>

## updateUserBotScore(user) ⇒ <code>Promise</code>
Update an individual, specific user's botscore

**Returns**: <code>Promise</code> - Successful botscore update (or not)  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | The user to update the botscore for |

<a name="twitterResponseFail"></a>

## twitterResponseFail(error)
If the twitter promise in getNewBotometerScore fails,
warn in the console with a detailed error.


| Param | Type | Description |
| --- | --- | --- |
| error | <code>Object</code> | The twitter error |

<a name="getNewBotometerScore"></a>

## getNewBotometerScore(user_id) ⇒ <code>Promise</code>
Get individual scores from Botometer based on user_id

**Returns**: <code>Promise</code> - The botscore of the user  

| Param | Type | Description |
| --- | --- | --- |
| user_id | <code>Number</code> | The twitter user's user ID |

<a name="getBotScore"></a>

## getBotScore(user_object, potentially_old_sn) ⇒ <code>Number</code>
Get the botscore (and maybe fresh screenname) of the user

**Returns**: <code>Number</code> - The botscore of the user  

| Param | Type | Description |
| --- | --- | --- |
| user_object | <code>Object</code> | The user object (containing ID, screenname, etc.) |
| potentially_old_sn | <code>String</code> | The user's screenname |

<a name="refreshGraph"></a>

## refreshGraph()
Refresh the graph no more than 30 times per second

<a name="updateNodeColor"></a>

## updateNodeColor(node_id, score)
Update an individual node's color


| Param | Type | Description |
| --- | --- | --- |
| node_id | <code>Number</code> | The id of the node |
| score | <code>Number</code> | The botscore of the account for that node |

<a name="getBaseColor"></a>

## getBaseColor(score) ⇒ <code>Object</code>
Set up base colors to allow for calling r, g, b of color  \
Helper function for getNodeColor() and getBorderColor()

**Returns**: <code>Object</code> - The color of the node with r, g, b properties  

| Param | Type | Description |
| --- | --- | --- |
| score | <code>Number</code> | The botscore used to get the correct color |

<a name="getRenderer"></a>

## getRenderer() ⇒ <code>Object</code>
Used to take a snapshot of the graph

**Returns**: <code>Object</code> - The render of the graph  
<a name="getNodeColor"></a>

## getNodeColor(score) ⇒ <code>Object</code>
Get the node's color based on botscore

**Returns**: <code>Object</code> - The color of the node  

| Param | Type | Description |
| --- | --- | --- |
| score | <code>Number</code> | The botscore |

<a name="getBorderColor"></a>

## getBorderColor(score) ⇒ <code>Object</code>
Get the node's border's color

**Returns**: <code>Object</code> - The color of the node's border  

| Param | Type | Description |
| --- | --- | --- |
| score | <code>Number</code> | The botscore |

<a name="KillGraph"></a>

## KillGraph()
Removes all information from the graph to start over

<a name="UpdateGraph"></a>

## UpdateGraph(start_time, end_time)
Create the graph


| Param | Type | Description |
| --- | --- | --- |
| start_time | <code>Date</code> | The earliest tweet, leftmost date on graph |
| end_time | <code>Date</code> | The latest tweet, rightmost date on graph |

<a name="GenerateUserModal"></a>

## GenerateUserModal(e)
Generates the modal that pops up when clicking on a node


| Param | Type | Description |
| --- | --- | --- |
| e | <code>Object</code> | `clickNode` type containing data pertinent to the Twitter account |

<a name="drawGraph"></a>

## drawGraph()
Draws the Sigma graph

<a name="zoomIn"></a>

## zoomIn()
Zoom in on the graph

<a name="zoomOut"></a>

## zoomOut()
Zoom out on the graph

<a name="redraw"></a>

## redraw()
Draw the graph

<a name="FilterEdges"></a>

## FilterEdges(filterTimestamp)
Filter edges shown based on timestamp window chosen in timeline


| Param | Type | Description |
| --- | --- | --- |
| filterTimestamp | <code>Number</code> | The timestamp that counts as  \ `timespan.end_time` during timelapse animation |

<a name="AnimateFilter"></a>

## AnimateFilter(timestamp)
Animates graph from beginning to end (or paused location to end)


| Param | Type | Description |
| --- | --- | --- |
| timestamp | <code>Number</code> | The current timestamp of the animation |

<a name="StartAnimation"></a>

## StartAnimation()
Start the graph animation (show tweets as they happened)

<a name="StopAnimation"></a>

## StopAnimation()
Stop the graph animation and show all nodes and edges again

<a name="PauseAnimation"></a>

## PauseAnimation()
Pause the graph animation

<a name="UnpauseAnimation"></a>

## UnpauseAnimation()
Resume the graph animation from a paused state

<a name="filterNodesByScore"></a>

## filterNodesByScore(max, min)
Filter nodes by botscore (e.g. between 3.0 and 4.0)


| Param | Type | Description |
| --- | --- | --- |
| max | <code>Number</code> | The high end botscore to filter nodes by |
| min | <code>Number</code> | The low end botscore to filter nodes by |

