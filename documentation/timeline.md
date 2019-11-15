## Functions

<dl>
<dt><a href="#redraw">redraw()</a></dt>
<dd><p>Redraw the timeline</p>
</dd>
<dt><a href="#removeUpdateDateRangeCallback">removeUpdateDateRangeCallback()</a></dt>
<dd><p>Initialize the timeline</p>
</dd>
<dt><a href="#dateFormatter">dateFormatter(d)</a> ⇒ <code>String</code></dt>
<dd><p>Formats the date using d3.time</p>
</dd>
<dt><a href="#calculateTweetRates">calculateTweetRates(chartData)</a></dt>
<dd><p>Shows how many new tweets of a particular type occurred at a point in time</p>
</dd>
<dt><a href="#_updateDateRange">_updateDateRange(extent)</a></dt>
<dd><p>Updates the date range if the user selected a different one</p>
</dd>
<dt><a href="#Update">Update(data)</a> ⇒ <code>Boolean</code></dt>
<dd><p>Updates the timeline with new data</p>
</dd>
<dt><a href="#UpdateTimestamp">UpdateTimestamp()</a></dt>
<dd><p>Update timestamp based on the graph&#39;s timestamp</p>
</dd>
</dl>

<a name="redraw"></a>

## redraw()
Redraw the timeline

<a name="removeUpdateDateRangeCallback"></a>

## removeUpdateDateRangeCallback()
Initialize the timeline

<a name="dateFormatter"></a>

## dateFormatter(d) ⇒ <code>String</code>
Formats the date using d3.time
 
**Returns**: <code>String</code> - The formatted time  

| Param | Type | Description |
| --- | --- | --- |
| d | <code>String</code> | The date to be formatted |

<a name="calculateTweetRates"></a>

## calculateTweetRates(chartData)
Shows how many new tweets of a particular type occurred at a point in time

| Param | Type | Description |
| --- | --- | --- |
| chartData | <code>Object</code> | The data that the timeline was drawn with |

<a name="_updateDateRange"></a>

## \_updateDateRange(extent)
Updates the date range if the user selected a different one

| Param | Type | Description |
| --- | --- | --- |
| extent | <code>Object</code> | The timeframe selection by the user |

<a name="Update"></a>

## Update(data) ⇒ <code>Boolean</code>
Updates the timeline with new data

**Returns**: <code>Boolean</code> - Will only return false if there's no data  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The data to update the timeline with |

<a name="UpdateTimestamp"></a>

## UpdateTimestamp()
Update timestamp based on the graph's timestamp
