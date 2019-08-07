<?php
	$post_data = '';
	if(isset($_POST) && isset($_POST["data"])){$post_data = ($_POST["data"]);}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Hoaxy&reg; by OSoMe</title>
	<?php include("./includes/includes.html"); ?>
	<meta charset="iso-639">
  	<meta http-equiv="X-UA-Compatible" content="IE=edge">
  	<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
	<div id="fb-root"></div>
	<div id="post_data" hidden aria-hidden="true"><?php echo json_encode($post_data, JSON_HEX_TAG); ?></div>
		<div id="vue-app" :class="{'modal-open':(show_edge_modal || show_node_modal)}">
			<div id="spinner" v-if="loading" v-bind:class="{'transparent':mounted}">
				<span class="fa outline"><i class="fa" :class="'fa-hourglass-' + spinner_state" :style="'transform: rotate('+spinner_rotate+'deg)'" aria-hidden="true"></i></span>
				<div class="outline" :style="'display: block'">
					<div>{{spinner_notices.articles}}</div>
					<div>{{spinner_notices.timeline}}</div>
					<div>{{spinner_notices.graph}}</div>
				</div>
			</div>
		<?php include("./includes/header.html" ); ?>
		<section id="form" class="container-fluid">
			<div class="container">
				<form v-if="import_or_search == 'search'" @submit.stop.prevent="submitForm()">
					<div class="col-12 text-center">
					<div class="col-12 text-center d-md-flex align-items-center">
						<div class="pr-2 text-nowrap">Search by:</div>
                            <div class="">
                                <div class="btn-group btn-group-toggle mr-2 rounded">
                                    <button id="searchByTwitter" data-toggle="tooltip" data-delay="0" title="search Twitter content from the past 7 days" type="button"
                                    class="btn btn-primary"
                                    v-on:click="twitterSearch()"
                                    @mouseOver="hoverTooltip"
                                    @mouseOut="hideTooltip"
                                    v-bind:class="{ 'active': twitterSearchSelected, 'text-light': twitterSearchSelected}">Twitter</button>
                                    <button id="searchByHoaxy" data-toggle="tooltip" title="search articles from misinformation and fact-checking sources" type="button"
                                    class="btn btn-primary"
									@mouseOver="hoverTooltip"
									@mouseOut="hideTooltip"
                                    v-on:click="hoaxySearch()"
                                    v-bind:class="{ 'active': hoaxySearchSelected, 'text-light': hoaxySearchSelected}">Hoaxy</button>
                                </div>
                            </div>
                            <input id="query" class="form-control my-2 my-md-0" type="text" ref="searchBox" data-toggle="tooltip" v-bind:title="searchByDependencyTitle" @focus="focusSearchBox();" @mouseOver="hoverTooltip" @mouseOut="hideTooltip" v-model="query_text" v-bind:placeholder="searchPlaceholder" :disabled="input_disabled" />&nbsp; &nbsp; &nbsp; &nbsp;
								<div for="name" class="control-label" v-if="twitterSearchSelected">
									Language:&nbsp;
								</div>
								<select class="form-control" style="width: auto" v-if="twitterSearchSelected" v-model="lang">
									<option value="ar">Arabic (العربية)</option>
									<option value="bn">Bengali (বাংলা)</option>
									<option value="bg">Bulgarian (български език)</option>
									<option value="zh">Chinese (中文, 汉语, 漢語)</option>
									<option value="en">English</option>
									<option value="fr">French (français)</option>
									<option value="de">German (Deutsch)</option>
									<option value="hi">Hindi (हिन्दी)</option>
									<option value="it">Italian (Italiano)</option>
									<option value="ja">Japanese (日本語)</option>
									<!--<option value="mkd">Macedonian (македонски јазик)</option>-->
									<option value="ms">Malay (بهاس ملايو‎)</option>
									<option value="pt">Portuguese (Português)</option>
									<option value="ru">Russian (русский)</option>
									<option value="es">Spanish (Español)</option>
									<option value="tr">Turkish (Türkçe)</option>
								</select>
						</div>
					</div>
					<div v-if="searchBy == 'Hoaxy'" class="col-12 text-center form-group">
						<span class="radio-container">
							<label class="">Show:
								<input v-model="query_sort" type="radio" name="sort_by" id='sort_by_relevant' checked value="relevant"  :disabled="input_disabled" /> Relevant
							</label>
						</span>
						<span class="radio-container">
							<label class="">
								<input v-model="query_sort" type="radio" name="sort_by" id="sort_by_recent" value="recent"  :disabled="input_disabled" /> Recent
							</label>
						</span>
					</div>
					<div v-else class="col-12 text-center form-group">
						<span class="radio-container">
							<label class="">Show:
								<input v-model="twitter_result_type" type="radio" name="result_type" id='search_by_recent' value="recent"  :disabled="input_disabled" /> Recent
							</label>
						</span>
						<span class="radio-container">
							<label class="">
								<input v-model="twitter_result_type" type="radio" name="result_type" id="search_by_popular" value="popular"  :disabled="input_disabled" /> Popular
							</label>
						</span>
						<span class="radio-container">
							<label class="">
								<input v-model="twitter_result_type" type="radio" name="result_type" id="search_by_mixed" checked value="mixed"  :disabled="input_disabled" /> Mixed
							</label>
						</span>
					</div>
					<div class="col-12 text-center">
						<input type="hidden" v-model="query_include_mentions" name="include_user_mentions" id="include_user_mentions_true" value="true"  :disabled="input_disabled" />
						<button class="btn btn-outline-primary" id="submit" :disabled="search_disabled" >{{ searchBy == 'Hoaxy' ? 'Search' : 'Search' }} </button>
						<button class="btn btn-primary ml-3" 
							@click.stop.prevent="import_or_search=(import_or_search=='import'?'search':'import')">Or Import Data</button>
					</div>					
				</form>				
				<div v-if="import_or_search == 'import'" class="">
					<div class="col-12 text-center">
						<div class="col-12 text-center d-md-flex align-items-center">
							<div class="pr-2 text-nowrap">Visualize Existing Data:</div>
							<input type="file" id="import_file" name="import_file" 
								@change="fileUploadHandler" 
								class="form-control form-control-file" />
						</div>
					</div>

					
					<div class="col-12 text-center mt-3">
							<input type="hidden" v-model="query_include_mentions" name="include_user_mentions" id="include_user_mentions_true" value="true"  :disabled="input_disabled" />
							<button class="btn btn-outline-primary" @click.stop.prevent="visualizeImportedData":disabled="!ready_to_visualize">Visualize</button>
							<button class="btn btn-primary ml-3" 
							@click.stop.prevent="import_or_search=(import_or_search=='import'?'search':'import')">Or Search</button>
					</div>
				</div>
				
				<div class="container">
				</div>
				
				<div class="clearfix"></div>
			</div>
		</section>
        <section id="dashboard" class="text-center">
            <div class="col-md-3 d-inline-block align-top m-0 p-0">
                <div class="table-responsive m-0 p-0">
                    <table class="table table-borderless m-0 p-0">
                        <tr>
                            <th class="text-left my-0 mx-2 py-0 px-2">Trending News</th>
                        </tr>
                        <tr v-for="article in top_usa_articles">
                            <td class="text-left m-2 p-2">
								<span>{{ article.shortened_source }} | {{ article.shortened_headline }} <a :href="article.url" target="_blank"><i @mouseOver="hoverTooltip"	@mouseOut="hideTooltip"  data-toggle="tooltip" title="click to read the article in a new window" class="fa fa-external-link"></i></a></span>
								<br>
								<span class="tight-span my-0 p-0"><a class="text-primary" v-on:click.prevent="changeAndFocusSearchQuery(article.headline,'mainstream');" rel="noreferrer noopener" :href="article.url" target="_blank" @mouseOver="hoverTooltip"	@mouseOut="hideTooltip"  data-toggle="tooltip" title="click to fill the search box with the article title, then click search">Search Title</a></span>
								<span class="tight-span my-0 mx-2 p-0"><a class="text-primary" v-on:click.prevent="changeAndFocusSearchQuery(article.url,'mainstream');" rel="noreferrer noopener" :href="article.url" target="_blank" @mouseOver="hoverTooltip"	@mouseOut="hideTooltip"  data-toggle="tooltip" title="click to fill the search box with the article link, then click search">Search Link</a></span>
                            </td>
                        </tr>
                        <tr v-if="top_usa_articles.length == 0">
                            <td colspan="3">Could not find any articles</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="col-md-3 d-inline-block align-top m-0 p-0">
                <div class="table-responsive m-0 p-0">
                    <table class="table table-borderless m-0 p-0">
                        <tr>
                            <th class="text-left my-0 mx-2 py-0 px-2">Popular Claims</th>
                        </tr>
                        <tr v-for="claim in top_claim_articles">
                            <td class="text-left m-2 p-2">
								<span>{{ claim.shortened_source }} | {{ claim.shortened_headline }} <a :href="claim.canonical_url" target="_blank"><i @mouseOver="hoverTooltip"	@mouseOut="hideTooltip"  data-toggle="tooltip" title="click to read the article in a new window" class="fa fa-external-link"></i></a></span>
								<br>
								<span class="tight-span my-0 p-0"><a class="text-primary" v-on:click.prevent="changeAndFocusSearchQuery(claim.title,'hoaxy');" rel="noreferrer noopener" :href="claim.canonical_url" target="_blank" @mouseOver="hoverTooltip"	@mouseOut="hideTooltip"  data-toggle="tooltip" title="click to fill the search box with the article title, then click search">Search Title</a></span>
							</td>
						</tr>
                        <tr v-if="top_claim_articles.length == 0">
                            <td colspan="3">Could not find any articles</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="col-md-3 d-inline-block align-top m-0 p-0">
                <div class="table-responsive m-0 p-0">
                    <table class="table table-borderless m-0 p-0">
                        <tr>
                            <th class="text-left my-0 mx-2 py-0 px-2">Popular Fact-Checks</th>
                        </tr>
                        <tr v-for="fact in top_fact_checking_articles">
                            <td class="text-left m-2 p-2">
								<span>{{ fact.shortened_source }} | {{ fact.shortened_headline }} <a :href="fact.canonical_url" target="_blank"><i @mouseOver="hoverTooltip"	@mouseOut="hideTooltip"  data-toggle="tooltip" title="click to read the article in a new window" class="fa fa-external-link"></i></a></span>
								<br>
								<span class="tight-span my-0 p-0"><a class="text-primary" v-on:click.prevent="changeAndFocusSearchQuery(fact.title,'hoaxy');" rel="noreferrer noopener" :href="fact.canonical_url" target="_blank" @mouseOver="hoverTooltip"	@mouseOut="hideTooltip"  data-toggle="tooltip" title="click to fill the search box with the article title, then click search">Search Title</a></span>
							</td>
                        </tr>
                        <tr v-if="top_fact_checking_articles.length == 0">
                            <td colspan="3">Could not find any articles</td>
                        </tr>
                    </table>
                </div>
            </div>
        </section>
        <section id="secondary_form" v-if="show_graphs">

            <div class="container pt-5 pb-3">
                <form @submit.stop.prevent="show_full_articles_list = false; submitForm()">
                    <input v-model="query_sort" type="hidden" name="sort_by" :disabled="input_disabled" />
                    <input type="hidden" v-model="query_include_mentions" name="include_user_mentions" id="include_user_mentions_true2" value="true"  :disabled="input_disabled" />
                    <div class="d-block d-md-flex justify-content-center align-items-center">
                        <div class="btn-group btn-group-toggle mr-md-2 rounded mb-2 mb-md-0 d-md-flex justify-content-md-center d-inline-block">
                            <button id="searchByTwitter2"
								type="button"
                                data-toggle="tooltip"
                                title="select to search for chatter on twitter"
                                class="btn btn-primary"
                                @click.prevent.stop="twitterSearch()"
                                :class="{ 'active': twitterSearchSelected, 'text-light': twitterSearchSelected}">Twitter</button>

                            <button id="searchByHoaxy2"
								type="button"
                                data-toggle="tooltip"
                                title="select to search for claims and fact-checks"
                                class="btn btn-primary"
                                @click.prevent.stop="hoaxySearch()"
                                :class="{ 'active': hoaxySearchSelected, 'text-light': hoaxySearchSelected}">Hoaxy</button>
                        </div>
                        <input class="form-control mr-md-2 mb-2 mb-md-0 "
                            type="text"
                            ref="searchBox2"
                            data-toggle="tooltip"
                            title="enter any phrase or url"
                            @focus="focusSearchBox();"
                            @change="focusSearchBox();"
                            v-model="query_text"
                            v-bind:placeholder="searchPlaceholder"
                            :disabled="input_disabled || show_full_articles_list == true" />
                        <button type="submit" v-if="!show_articles || !show_full_articles_list" class="btn btn-primary btn-blue" :disabled="search_disabled" >{{ searchBy == 'Hoaxy' ? 'Search' : 'Search' }} </button>
                        <button @click.stop.prevent="show_full_articles_list = true" class="btn btn-primary ml-md-2 text-nowrap" v-if="show_articles && !show_full_articles_list">{{checked_articles.length}} article{{checked_articles.length!=1?"s":""}} visualized &bull;&bull;&bull;</button>
                        <button @click.stop.prevent="show_full_articles_list = false" :disabled="checked_articles.length <= 0" class="btn btn-primary ml-md-2" v-if="show_articles && show_full_articles_list">Cancel</button>
                    </div>
<transition name="slide_in">
                    <div id="article_list_container" v-show="show_articles && show_full_articles_list">
                        <div class="card p-2">
                            <div class="text-right d-flex align-items-center flex-column flex-sm-row" >
								<label class="mt-3 d-block" style="white-space: nowrap">
									<input type="checkbox" id="select_all" @change="selectTop20" :checked="all_selected" style="display: none"/>
									<span class="check_icons text-center">
										<i class="fa fa-square-o fw" aria-hidden="true"></i>
										<i class="fa fa-check-square-o fw" aria-hidden="true"></i>
									</span>

									<span class="ml-2 article_title">Select Top 20</span>
								</label>
                                <div class="text-left m-3">
                                    Select up to 20 articles from the list and click "Visualize Articles" to generate a timeline and network graph based on your selection.
                                </div>
                                <div class="mb-3 mb-sm-0">
                                    <button @click.stop.prevent="visualizeSelectedArticles();" :disabled="checked_articles.length <= 0" class="btn btn-primary">Visualize {{checked_articles.length}} article{{checked_articles.length!=1?"s":""}}</button>
                                </div>
                            </div>
                            <div class="d-flex row">
                                <div class="col-12">
                                    <ul class="list-unstyled d-block" id="article_list">
                                        <li v-for="article, index in getSubsetOfArticles()" :class="article.site_type"
                                        class="rounded d-block">
	                                        <label class="row p-3">
	                                            <input type="checkbox" :id="article.url_id" :value="article.url_id" v-model="checked_articles" />
	                                            <div class="check_icons col-sm-1 col-2 pl-2 pl-sm-3 text-center d-flex align-items-center ">
	                                                <i class="fa fa-square-o fw" aria-hidden="true"></i>
	                                                <i class="fa fa-check-square-o fw" aria-hidden="true"></i>
	                                            </div>
	                                            <div class="col-sm-11 col-10">
	                                                <span class="article_title"><a :href="article.url_raw" target="_blank">{{article.title}}</a></span>
	                                                <span class=""><span class="article_domain">From <a :href="'http://' + article.site_domain" target="_blank">{{article.site_domain}}</a></span>
	                                                <span class="article_date">on {{getDateline(article.date_published)}}</span></span>
	                                                <span class="article_stats"><span><b>{{article.number_of_tweets}}</b> Tweets</span></span>
	                                                <div class="clearfix"></div>
	                                            </div>
	                                        </label>
	                                    </li>
	                                </ul>
	                                <div>
	                                    <div class="text-center">
	                                        <button @click.stop.prevent="visualizeSelectedArticles()" class="btn btn-primary btn-blue" id="visualize">Visualize {{checked_articles.length}} article{{checked_articles.length!=1?"s":""}}</button>

	                                        <span class="text-center" id="load_more">
	                                            <button class="btn btn-warning" :disabled="articles_to_show >= articles.length" @click.stop.prevent="loadMore()"> Load More Articles </button>
	                                            <div v-if="articles_to_show >= 100 && articles.length >= 100" class="text-muted">Your query has found too many matches for us to load. Please narrow down your query and try again to get more articles.</div>
	                                            <div v-if="articles_to_show >= articles.length && articles.length < 100" class="text-muted">We couldn't find any more articles for this query.</div>
	                                        </span>
	                                    </div>
	                                </div>
	                            </div>
	                        </div>
                        </div>
                    </div>
</transition>
                </form>
            </div>
    </section>
    <section id="graphs" v-bind:class="{'hidden': !show_graphs}"class="container-fluid row no-gutters pt-1">
		<div id="timeline"
            class="col-12 card"
            :style="graph_column_size <= 0 ? 'display: none' : ''"
            :class="'col-md-' + (graph_column_size === 12? 11: graph_column_size )">
            <p class="text-center">Timeline</p>
            <div id="chart" style="width: 100%; height: 80vh; margin: 0 auto;" v-if="!failed_to_get_network">
                <svg></svg>
            </div>
            <div id="focus_label" class="text-center small" v-if="!failed_to_get_network">Select and drag a time frame of interest below:</div>
        </div>
        <div class="col-md-1 col-12 text-center ">
            <div class="d-none d-md-block d-md-flex flex-md-column justify-content-center align-items-center">
				<p class="m-0 text-center ">Layout</p>
	            <button id=""  :disabled="graph_column_size >= 12"  class=" layout-button layout-button-timeline btn btn-primary" @click="resizeGraphs(12)">
					<span><i class="fa fa-line-chart" aria-hidden="true"></i></span></button>
	            <button id=""  :disabled="graph_column_size == 3"  class=" layout-button layout-button-split btn btn-primary" @click="resizeGraphs(3)">
					<span><i class="fa fa-line-chart" aria-hidden="true"></i></span><span><i class="fa fa-share-alt" aria-hidden="true"></i></span></button>
	            <button id=""  :disabled="graph_column_size <= 0"  class=" layout-button layout-button-graph btn btn-primary" @click="resizeGraphs(0)">
					<span><i class="fa fa-share-alt" style="height: 2rem; width: 1.8rem; padding-top: .05rem;" aria-hidden="true"></i>
						<i class="fa fa-rotate-180 fa-share-alt" style="height: 1rem; width: .7rem" aria-hidden="true"></i></span></button>
			</div>
			<div class="mt-3 text-center" id="legend">
				<template v-if="searchedBy == 'Hoaxy'">
					<label class="d-inline-block d-md-block"><span class=" line claim_label">&nbsp;</span><br /> Claims</label>
					<label class="d-inline-block d-md-block"><span class=" line fact_checking_label">&nbsp;</span><br /> Fact-Checks</label>
				</template>
				<template v-else>
					<label class="d-inline-block d-md-block"><span class=" line claim_label">&nbsp;</span><br /> Tweets</label>
				</template>
			</div>
			<div class="mt-3 text-center d-md-flex flex-column justify-content-center align-items-center">
				<p class="m-0 text-center" >Play</p>
				<div class="mt-1 d-inline-block d-md-block">
					<button @click="startGraphAnimation" :disabled="!animationAvailable || failed_to_get_network" v-if="!graphAnimation.playing" class="animation-control btn btn-primary"><i class="fa fa-play" aria-hidden="true"></i></button>
					<button @click="unpauseGraphAnimation" v-if="graphAnimation.playing && graphAnimation.paused" class="animation-control btn btn-primary"><i class="fa fa-play" aria-hidden="true"></i></button>
					<button @click="pauseGraphAnimation" v-if="!graphAnimation.paused && graphAnimation.playing" class="animation-control btn btn-primary"><i class="fa fa-pause" aria-hidden="true"></i></button>
				</div>
				<div class="mt-1 d-inline-block d-md-block">
					<button @click="stopGraphAnimation" :disabled="!graphAnimation.playing" class="animation-control btn btn-primary"><i class="fa fa-stop" aria-hidden="true"></i></button>
				</div>
			</div>
			<div id="sharing_buttons" class="mt-4 d-flex flex-column justify-content-center align-items-center" v-if="show_graphs">
	<p class="m-0 text-center mb-1">Share</p>
					<span id="twitter-button">
							<a class="twitter-share-button"
							href="https://twitter.com/share"
							data-text="Hoaxy: How claims spread online"
							data-size="large">
							Tweet</a>
					</span>
					<span id="fb-button">
							<span class="fb-share-button" data-href="" data-layout="button" data-size="large" data-mobile-iframe="true">
									<a class="fb-xfbml-parse-ignore" target="_blank"
									href="">Share</a>
							</span>
					</span>
			</div>
			<div class="d-block p-2 text-center d-md-flex flex-column justify-content-center align-items-center">
				<button class="btn btn-primary ml-1 mr-1" style="z-index: 0; font-size: .75rem" type="button" v-on:click="prepareAndShowWidgetCode()" data-toggle="tooltip" @mouseOver="hoverTooltip" @mouseOut="hideTooltip" :disabled="failed_to_get_network" title="add this visualization to your site">Embed</button>
			</div>
			<div class="d-block p-2 text-center d-md-flex flex-column justify-content-center align-items-center">
				<button class="btn btn-primary ml-1 mr-1 text-nowrap" style="z-index: 0; font-size: .75rem" type="button" @click='downloadCSV(buildJSONContent())' data-toggle="tooltip" @mouseOver="hoverTooltip" @mouseOut="hideTooltip"  :disabled="failed_to_get_network" title="download data as a CSV file">Export - CSV</button>
			</div>
			<div class="d-block p-2 text-center d-md-flex flex-column justify-content-center align-items-center">
				<button class="btn btn-primary ml-1 mr-1 text-nowrap" style="z-index: 0; font-size: .75rem" type="button" @click='downloadJSON(buildJSONContent())' data-toggle="tooltip" @mouseOver="hoverTooltip" @mouseOut="hideTooltip"  :disabled="failed_to_get_network" title="download data as a JSON file">Export - JSON</button>
			</div>
		</div>
        <div id="sigmagraph"
            class="col-12 card"
            :style="graph_column_size >= 12 ? 'display: none' : ''"
            :class="'col-md-' + (12-graph_column_size-1)">
            <p class="text-center">Diffusion Network</p>
            <div id="graph_error" class="p-5 d-flex flex-column justify-content-center" v-if="failed_to_get_network">
                There was not enough data to create a network graph.  Try selecting more popular articles and trying again.
            </div>
            <div id="graph-container" style="width: 100%; height: 80vh; margin: 0 auto;">
            </div>
				<div>
					<div class="d-block p-2" v-if="show_zoom_buttons" id="graph_help_text">
						Click on network nodes and edges for details. Click on color scale to filter nodes by color.
					</div>
				</div>
	        <div class="d-flex-inline flex-column align-items-end " id="zoom_buttons" v-if="show_zoom_buttons">
				<div class="rounded graph_legend">
					<div class="bg-light bg-semi-transparent"></div>
					<div class="d-flex p-2 flex-row justify-content-center ">
		                <button class="btn btn-primary ml-1 mr-1" type="button" value ="-" id="zoom-out" v-if="show_zoom_buttons" @click="zoomOutGraph"><i class="fa fa-minus" aria-hidden="true"></i></button>
		                <button class="btn btn-primary ml-1 mr-1" type="button" value ="+" id="zoom-in" v-if="show_zoom_buttons" @click="zoomInGraph"><i class="fa fa-plus" aria-hidden="true"></i></button>
		            </div>
		            <div class="mt-2 p-2 text-center">
										<div class="alert bg-warning m-1 p-1 text-wrap" v-if="twitterRateLimitReachedObj.isReached">New scores cannot be retrieved.</br>Twitter rate limit reached, </br>try again in 15 minutes.</div>
		                <button v-if="!getting_bot_scores.running" @click.stop.prevent="getMoreBotScores" class="btn btn-primary" id="">Update Bot Scores</button>
		                <button v-if="getting_bot_scores.running" disabled class="disabled btn btn-primary" id="">Fetching Scores...</button>
		                <div class="text-right pt-1">
		                    <div>{{graph.score_stats.found}} of {{graph.score_stats.total}} scores found.</div>
		                    <div v-if="graph.score_stats.found > 0" style="cursor: pointer" @click="info_text='Fresh indicates that the bot score was calculated relatively recently.'">
								{{graph.score_stats.found - graph.score_stats.old}} {{graph.score_stats.found - graph.score_stats.old == 1?'is':'are'}} fresh.
							</div>
		                    <div v-if="graph.score_stats.unavailable > 0">{{graph.score_stats.unavailable}} could not be updated.</div>
                        </div>
                    </div>
                    <div class="mt-2 p-2 text-center">
                        <div class="row" style="cursor: pointer" @click="info_text='Each circular node represents a twitter account. The larger the circle, the more popular the account. Colors indicate the likelihood that the account is a bot.'">
                            <div class="p-1 text-right col-6">
                                <i class="fa fa-circle-o" aria-hidden="true"></i>
                                <i class="fa fa-circle-o fa-lg" aria-hidden="true"></i>
                            </div>
                            <div class="p-1 text-left col-6">
								<i class="float-right pr-2 info-button fa fa-question-circle" aria-hidden="true"></i>
                                Accounts
                            </div>
                        </div>
                        <div class="row"  style="cursor: pointer" @click="info_text='The edges that connect the nodes represent tweets that connect accounts through retweets or mentions.  The direction of the arrow indicates the flow of information. The color of the edge indicates whether the tweet contains a link to a claim or a link to a fact-checking article'">
                            <div class="p-1 text-right col-6">
                                <i class="fa fa-long-arrow-left" aria-hidden="true"></i>
                                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                            </div>
                            <div class="p-1 text-left col-6">
								<i class="float-right pr-2  info-button fa fa-question-circle" aria-hidden="true"></i>
                                Tweets
                            </div>
                        </div>
					</div>
                </div>
				<div style="cursor: pointer"
					v-if="show_zoom_buttons"
					id="bot_legend"
					class="text-right p-2">
					<div id="bot_legend_gradient">
						<div>
							<span class="d-flex justify-content-center">Bot</span>
							<span class="d-flex justify-content-center">Like</span>
						</div>
						<div class="rounded d-flex flex-column">
								<div @click="filterNodesByScore(.8, 1.1)" class="d-flex justify-content-center align-items-center bot_legend_section rounded-top" 
									:class="{'selected_node_filter': nodes_filtered_by_score == '1.1 0.8'}"
									:style="'background-color: rgba('+ colors.node_colors.botscores[0].red + ','+ colors.node_colors.botscores[0].green + ','+ colors.node_colors.botscores[0].blue + ', .9)'">
										<span v-text="botscoreCount(.8, 1.1)">100</span>
								</div>
								<div @click="filterNodesByScore(.6, .8)" class="d-flex justify-content-center align-items-center bot_legend_section" 
									:class="{'selected_node_filter': nodes_filtered_by_score == '0.8 0.6'}"
									:style="'background-color: rgba('+ colors.node_colors.botscores[1].red + ','+ colors.node_colors.botscores[1].green + ','+ colors.node_colors.botscores[1].blue + ', .9)'">
										<span v-text="botscoreCount(.6, .8)">200</span>
								</div>
								<div @click="filterNodesByScore(.4, .6)" class="d-flex justify-content-center align-items-center bot_legend_section" 
									:class="{'selected_node_filter': nodes_filtered_by_score == '0.6 0.4'}"
									:style="'background-color: rgba('+ colors.node_colors.botscores[2].red + ','+ colors.node_colors.botscores[2].green + ','+ colors.node_colors.botscores[2].blue + ', .9)'">
										<span v-text="botscoreCount(.4, .6)">500</span>
								</div>
								<div @click="filterNodesByScore(.2, .4)" class="d-flex justify-content-center align-items-center bot_legend_section" 
									:class="{'selected_node_filter': nodes_filtered_by_score == '0.4 0.2'}"
									:style="'background-color: rgba('+ colors.node_colors.botscores[3].red + ','+ colors.node_colors.botscores[3].green + ','+ colors.node_colors.botscores[3].blue + ', .9)'">
										<span v-text="botscoreCount(.2, .4)">300</span>
								</div>
								<div @click="filterNodesByScore(0, .20)" class="d-flex justify-content-center align-items-center bot_legend_section rounded-bottom" 
									:class="{'selected_node_filter': nodes_filtered_by_score == '0.2 0'}"
									:style="'background-color: rgba('+ colors.node_colors.botscores[4].red + ','+ colors.node_colors.botscores[4].green + ','+ colors.node_colors.botscores[4].blue + ', .9)'">
										<span v-text="botscoreCount(0, .20)">100</span>
								</div>
							</div>
							<div>
								<span class="d-flex justify-content-center">Human</span>
								<span class="d-flex justify-content-center">Like</span>
							</div>
					</div>
				</div>
	        </div>
    </div>
    </section>
<transition name="fade">
	<div id="tutorial" class="d-flex align-items-center justify-content-center" style="display: none; position: relative;"
		:style="tutorial.show?'display: block; position: fixed;':''"
		v-if="tutorial.show">
		<div id="tutorial-content" class="d-flex text-center align-items-center justify-content-center">
			<div id="tutorial-carousel" class="carousel slide h-100 pt-5">
			  <ol class="carousel-indicators">
			    <li v-for="number, index in [ 1, 2, 3, 4, 5]" @click="tutorialGotoSlide(number)" :class="{'active':tutorial.active_slide == number}"></li>
			  </ol>
			  <div class="text-center small btn-sm btn btn-link close-tutorial-button" @click="tutorialHideWithCookie">
				  Click to close tutorial. We use a cookie so that this won’t pop up again the next time you use Hoaxy.
			  </div>
			  <div class="carousel-inner  rounded">
				<div class="carousel-item text-center" v-for="number, index in [1, 2, 3, 4, 5]" :class="{'active':tutorial.active_slide == number}">
					<div class="d-flex">
						<img class="d-block rounded align-self-center" :src="'./static/tutorial_slides/Slide'+(number)+'.PNG'" alt="Tutorial Slide">
			  		</div>
			    </div>
			  </div>
			  <a v-if="tutorial.active_slide > 1" @click="tutorialPreviousSlide()" class="carousel-control-prev" role="button">
			    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
			    <span class="sr-only">Previous</span>
			  </a>
			  <a v-if="tutorial.active_slide < 5" @click="tutorialNextSlide()" class="carousel-control-next" role="button">
			    <span class="carousel-control-next-icon" aria-hidden="true"></span>
			    <span class="sr-only">Next</span>
			  </a>
			  <a v-if="tutorial.active_slide == 5" @click="tutorialHide()" class="carousel-control-next" role="button">
			    <span class="carousel-control-next-icon" aria-hidden="true"></span>
			    <span class="sr-only">Finish</span>
			  </a>
			</div>
		</div>
	</div>
</transition>
		<div id="widgetModal" :class="{'modal-show': showWidgetModal}" @click.stop="resetWidgetContent()" class="modal" tabindex="-1" role="dialog"
		aria-labelledby="infoModalLabel" style="opacity: 1" aria-labelledby="nodeModalLabel">
			<div id="modalDialogWidget" class="modal-dialog" style="pointer-events: auto;" role="document">
				<div @click.stop="" class="alert m-5 alert-info">
					<div class="modal-body" id="infoModalBody">
						<div class="d-flex flex-column">
							<span class="pl-1">Add the below code to your site:</span>
							<textarea class="w-100" rows="5" ref="widgetCodeTextArea" id="widgetCodeTextArea">{{ embeddedWidgetCode }}</textarea>
						</div>
						<div class="align-items-center text-center" v-show="copiedWidgetText">Copied text to clipboard</div>
						<div class="align-items-center text-center mt-1">
								<button type="button" class="btn btn-secondary" @click.stop="copyWidgetCodeToClipboard()">Copy to Clipboard</button>
								<button type="button" class="btn btn-secondary" @click.stop="resetWidgetContent()">Close</button>
						</div>
						<div class="mt-2">
							<div class="pl-1">What you will see:</div>
							<div v-html="embeddedWidgetCode"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
        <div id="infoModal"
			:class="{'modal-show': info_text!==''}"
			@click.stop="info_text=''"
			class="modal " tabindex="-1"
			role="dialog"
			aria-labelledby="infoModalLabel"
			style="opacity: 1;"
			aria-labelledby="nodeModalLabel">
            <div class="modal-dialog" role="document">
                <div @click.stop="" class="alert m-5 alert-info">
                    <div class="modal-body" id="infoModalBody">
						<div class="d-flex align-items-center">
							<i class="float-left mr-4 fa fa-3x fa-question-circle" aria-hidden="true"></i>
							<span class="pl-2">{{info_text}}</span>
						</div>
                    </div>
                    <div class="modal-border-top">
                        <button type="button" class="btn btn-secondary" @click="info_text = ''">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="tutorialModal" :class="{'modal-show': show_tutorial_modal}" @click.stop="toggleTutorialModal()" class="modal" tabindex="-1"
		role="dialog" aria-labelledby="tutorialModalLabel" :style="modal_opacity?'opacity: 1;':'opacity: 0;'" aria-labelledby="nodeModalLabel">
            <div class="modal-dialog" role="document">
                <div @click.stop="" class="alert m-5 alert-info">
                    <div class="modal-border-bottom">
                        <h4 class="modal-title text-center" id="tutorialModalLabel">Tutorial</h4>
						<button type="button" class="close float-right"  @click="toggleTutorialModal()"aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body text-center" id="tutorial_modalBody">
                    </div>
                    <div class="modal-border-top">
                        <button type="button" class="btn btn-secondary" @click="toggleTutorialModal()">Close</button>
                    </div>
                </div>
            </div>
		</div>
		<div id="authenticateModal" :class="{'modal-show': show_authenticate_modal}" @click.stop="toggleModal('authenticate')" class="modal " tabindex="-1" role="dialog" aria-labelledby="authenticateModalLabel"  :style="modal_opacity?'opacity: 1;':'opacity: 0;'" aria-labelledby="nodeModalLabel">
            <div class="modal-dialog" role="document">
                <div @click.stop="" class="alert m-5 alert-info">
                    <div class="modal-border-bottom">
                        <h4 class="modal-title text-center" id="authenticateModalLabel" >
							Twitter Error
                        </h4>
						<button type="button" class="close float-right"  @click="toggleModal('authenticate')" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body" id="authenticateModalBody" >
						<div class="">
							<p>There was an issue contacting Twitter.  Please try again by clicking the button below and re-authenticate with Twitter if necessary.</p>
							<p><button class="btn btn-success btn-lg" @click="submitForm(true); toggleModal('authenticate')">Retry Query</button></p>
						</div>
                    </div>
                    <div class="modal-border-top">
                        <button type="button" class="btn btn-secondary" @click="toggleModal('authenticate')">Close</button>
                    </div>
                </div>
            </div>
        </div>
		<div id="errorModal" :class="{'modal-show': show_error_modal}" @click.stop="toggleErrorModal()" class="modal " tabindex="-1" role="dialog" aria-labelledby="errorModalLabel"  :style="modal_opacity?'opacity: 1;':'opacity: 0;'" aria-labelledby="nodeModalLabel">
			<div class="modal-dialog" role="document">
				<div @click.stop="" class="alert m-5 alert-danger">
					<div class="modal-border-bottom">
						<h4 class="modal-title text-center" id="errorModalLabel">An Error Occurred</h4>
						<button type="button" class="close float-right"  @click="toggleErrorModal()"aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</div>
					<div class="modal-body" id="errorModalBody" >
						<div class="d-flex align-items-center">
							<i class="float-left m-2 fa fa-3x fa-exclamation-triangle" aria-hidden="true"></i>
							<span>{{error_message}}</span>
						</div>
					</div>
					<div class="modal-border-top">
						<button type="button" class="btn btn-secondary" @click="toggleErrorModal()">Close</button>
					</div>
				</div>
			</div>
		</div>
		<div id="edgeModal" :class="{'modal-show': show_edge_modal}" @click.stop="toggleEdgeModal()" class="modal " tabindex="-1" role="dialog" aria-labelledby="edgeModalLabel"  :style="modal_opacity?'opacity: 1;':'opacity: 0;'" aria-labelledby="nodeModalLabel">
			<div class="modal-dialog" role="document">
				<div @click.stop="" class="modal-content">
					<div class="modal-border-bottom">
						<button type="button" class="close"  @click="toggleEdgeModal()"aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 class="modal-title text-center" id="edgeModalLabel" >
							<a target="_blank" :href="'https://twitter.com/intent/user?user_id='+ edge_modal_content.edge.source">@{{edge_modal_content.edge.source_screenName}}</a>
							{{ edge_modal_content.label_string }}
							<a target="_blank" :href="'https://twitter.com/intent/user?user_id='+ edge_modal_content.edge.target">@{{edge_modal_content.edge.target_screenName}}</a>
						</h4>
					</div>
					<div class="modal-body" id="edgeModalBody" >
						<template v-for="(id, index) in edge_modal_content.edge.outgoing_ids">
							{{edge_modal_content.edge.titles[index]}}
							<div class="modal_links">See <a target="_blank" :href="edge_modal_content.tweet_urls[id]">tweet</a><template v-if="searchedBy == 'Hoaxy'">  or  <a target="_blank" :href="edge_modal_content.edge.url_raws[index]">article</a></template></div>
						</template>
					</div>
					<div class="modal-border-top">
						<button type="button" class="btn btn-default" @click="toggleEdgeModal()">Close</button>
					</div>
				</div>
			</div>
		</div>
		<div id="nodeModal"  :class="{'modal-show': show_node_modal}" @click.stop="toggleNodeModal()" class="modal"  tabindex="-1" role="dialog" :style="modal_opacity?'opacity: 1;':'opacity: 0;'" aria-labelledby="nodeModalLabel">
			<div class="modal-dialog"  role="document">
				<div class="modal-content" @click.stop="">
					<div class="modal-border-bottom">
						<button type="button" class="close" @click.stop="toggleNodeModal()" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 class="modal-title text-center" id="nodeModalLabel">
							Account:  <a target="_blank" v-bind:href="'https://twitter.com/intent/user?user_id=' + node_modal_content.user_id">@{{node_modal_content.screenName}}</a>
						</h4>
					</div>
					<div class="modal-body" >
						<div>
							<h5>Botometer Score: <span v-if="!node_modal_content.botscore"><b>Unavailable</b></span></h5>
								<div class="text-center" v-if="node_modal_content.botscore > 0">
									<div class="botscore alert" :style="{'background-color': node_modal_content.botcolor, 'color': node_modal_content.botscore !== false && node_modal_content.botscore >= 0 && node_modal_content.botscore < 35 ?'black':'black' }">
										<h1 class="m-0 p-0" style="color: black">{{Number((node_modal_content.botscore/100) * 5 ).toFixed(1)}} / 5</h1>
									</div>
									<div class="d-flex justify-content-center h3">
										<div class="botimages">
											<div class="images-nots"><div :style="'width: '+node_modal_content.botscore+'%'" class="images-bots"></div></div>

                                    </div>
                                </div>
                            </div>
                                <span v-if="node_modal_content.botscore < 0">Could not be retrieved.  It is possible that this account's timeline is set to private or has been deleted entirely.</span>
								<div v-if="node_modal_content.botscore > 0">Last calculated: {{formatTime(node_modal_content.timestamp)}}</div>
								<div class="alert bg-warning" v-if="twitterRateLimitReachedObj.isReached">Warning: New scores cannot be retrieved. Twitter rate limit reached, try again in 15 minutes.</div>
								<div class="alert bg-warning"
										 v-if="node_modal_content.showStaleContent && !getting_bot_scores.running && node_modal_content.staleAcctInfo.isStale">
										 Warning: This account has changed its screen name from
										 <a v-bind:href="'https://twitter.com/' + node_modal_content.staleAcctInfo.oldSn" target="_blank">
											 @{{ node_modal_content.staleAcctInfo.oldSn }}
										 </a> (<a v-bind:href="'https://botometer.iuni.iu.edu/#!/?sn=' + node_modal_content.staleAcctInfo.oldSn" target="_blank">details</a>) to
										 <a v-bind:href="'https://twitter.com/intent/user?user_id=' + node_modal_content.staleAcctInfo.newId" target="_blank">
											 @{{ node_modal_content.staleAcctInfo.newSn }}
										 </a> (<a v-bind:href="'https://botometer.iuni.iu.edu/#!/?sn=' + node_modal_content.staleAcctInfo.newSn" target="_blank">details</a>)
								</div>
								<div class="alert bg-warning"
										 v-if="node_modal_content.staleAcctInfo.openedModalWhileFetchingScores">
										 Warning: This modal content may be stale as we are now fetching more data. Open this content again once new data is fetched.
								</div>
								<div class="alert modal-informational"
										 v-if="!node_modal_content.showStaleContent">
										 Details not available. Click the "Update" button to fetch latest bot score and details for this account.
								</div>
								<div class="alert modal-informational"
										 v-else-if="!node_modal_content.staleAcctInfo.isStale && node_modal_content.showStaleContent && !getting_bot_scores.running">
										 We estimate a {{ node_modal_content.completeAutomationProbability }}% probability that this account is completely automated. Click <a v-bind:href="'https://botometer.iuni.iu.edu/#!/?sn=' + node_modal_content.staleAcctInfo.oldSn" target="_blank">here</a> for more details from Botometer.
								</div>
								<div class="alert modal-informational"
										 v-else-if="node_modal_content.staleAcctInfo.isStale && node_modal_content.showStaleContent && !getting_bot_scores.running">
										 We estimate a {{ node_modal_content.completeAutomationProbability }}% probability that this account is completely automated. Click <a v-bind:href="'https://botometer.iuni.iu.edu/#!/?sn=' + node_modal_content.staleAcctInfo.newSn" target="_blank">here</a> for more details from Botometer.
								</div>
							<p class="my-2" v-if="">
								<button v-if="!getting_bot_scores.running" @click.stop.prevent="getSingleBotScore(node_modal_content.user_id)" class="btn btn-primary" id="">Update</button>
								<button v-if="getting_bot_scores.running" class="btn btn-primary disabled" disabled id="">Getting Bot Score...</button>
								<button v-if="node_modal_content.botscore > 0" class="btn btn-primary" @click="feedback_form.display = !feedback_form.display" >Feedback</button>
							</p>
							<div v-if="node_modal_content.botscore > 0">
								<form class="form" v-if="feedback_form.display" @submit.prevent="submitFeedbackForm">
									<br />
									<div class="form-group">
										<label>The account @{{node_modal_content.screenName}} is a :</label>
										<select v-model="feedback_form.type" class="form-control">
											<option v-for="value, key in feedback_form.type_choices" :value="value">{{key}}</option>
										</select>
									</div>
									<div class="form-group">
										<label>I know this because:</label>
										<textarea v-model="feedback_form.comment" class="form-control"></textarea>
									</div>
									<div class="form-group">
										<input type="submit" class="btn btn-primary" value="Submit Feedback" />
									</div>
								</form>
							</div>
						</div>
						<h2>has quoted: <span v-if="node_modal_content.has_quoted_count == 0">nobody</span></h2>
						<template v-for="user in node_modal_content.has_quoted">
							<h3>Account:  <a target="_blank" v-bind:href="user.user_url">{{user.screenName}}</a> </h3>
							<template v-for="(title, index) in user.article_titles">
									<div class='article_headline'>{{title}}</div>
									<div class="modal_links">See <a target="_blank" :href="user.tweet_urls[index]">tweet</a><template v-if="searchedBy == 'Hoaxy'"> or <a target="_blank" :href="user.article_urls[index]">article</a></template></div>
							</template>
						</template>
						<h2>was quoted by: <span v-if="node_modal_content.is_quoted_by_count == 0">nobody</span></h2>
						<template v-for="user in node_modal_content.is_quoted_by">
							<h3>Account:  <a target="_blank" v-bind:href="user.user_url">{{user.screenName}}</a></h3>
							<template v-for="(title, index) in user.article_titles">
									<div class='article_headline'>{{title}}</div>
									<div class="modal_links">See <a target="_blank" :href="user.tweet_urls[index]">tweet</a><template v-if="searchedBy == 'Hoaxy'"> or <a target="_blank" :href="user.article_urls[index]">article</a></template></div>
							</template>
						</template>
						<h2>has mentioned: <span v-if="node_modal_content.has_mentioned_count == 0">nobody</span></h2>
						<template v-for="user in node_modal_content.has_mentioned">
							<h3>Account:  <a target="_blank" v-bind:href="user.user_url">{{user.screenName}}</a></h3>
							<template v-for="(title, index) in user.article_titles">
									<div class='article_headline'>{{title}}</div>
									<div class="modal_links">See <a target="_blank" :href="user.tweet_urls[index]">tweet</a><template v-if="searchedBy == 'Hoaxy'"> or <a target="_blank" :href="user.article_urls[index]">article</a></template></div>
							</template>
						</template>
						<h2>was mentioned by: <span v-if="node_modal_content.is_mentioned_by_count == 0">nobody</span></h2>
						<template v-for="user in node_modal_content.is_mentioned_by">
							<h3>Account:  <a target="_blank" v-bind:href="user.user_url">{{user.screenName}}</a></h3>
							<template v-for="(title, index) in user.article_titles">
									<div class='article_headline'>{{title}}</div>
									<div class="modal_links">See <a target="_blank" :href="user.tweet_urls[index]">tweet</a><template v-if="searchedBy == 'Hoaxy'"> or <a target="_blank" :href="user.article_urls[index]">article</a></template></div>
							</template>
						</template>
						<h2>has retweeted: <span v-if="node_modal_content.has_retweeted_count == 0">nobody</span></h2>
						<template v-for="user in node_modal_content.has_retweeted">
							<h3>Account:  <a target="_blank" v-bind:href="user.user_url">{{user.screenName}}</a></h3>
							<template v-for="(title, index) in user.article_titles">
									<div class='article_headline'>{{title}}</div>
									<div class="modal_links">See <a target="_blank" :href="user.tweet_urls[index]">tweet</a><template v-if="searchedBy == 'Hoaxy'"> or <a target="_blank" :href="user.article_urls[index]">article</a></template></div>
							</template>
						</template>
						<h2>was retweeted by: <span v-if="node_modal_content.is_retweeted_by_count == 0">nobody</span></h2>
						<template v-for="user in node_modal_content.is_retweeted_by">
							<h3>Account:  <a target="_blank" v-bind:href="user.user_url">{{user.screenName}}</a></h3>
							<template v-for="(title, index) in user.article_titles">
									<div class='article_headline'>{{title}}</div>
									<div class="modal_links">See <a target="_blank" :href="user.tweet_urls[index]">tweet</a><template v-if="searchedBy == 'Hoaxy'"> or <a target="_blank" :href="user.article_urls[index]">article</a></template></div>
							</template>
						</template>
					</div>
					<div style="border-top: 1px solid #ccc;">
						<button type="button" class="btn btn-primary" style="float: right" @click.stop="toggleNodeModal()">Close</button>
					</div>
				</div>
			</div>
		</div>
		<div id="toolTipContainer" class="tooltip bs-tooltip-bottom" :style="{'top':tooltip.top + 'px', 'left':tooltip.left + 'px'}"
			:class="{'show': tooltip.show}" style="position: absolute; font-weight:bold;" v-if="tooltip.show">
		<div class="ml-4 arrow"></div>
			<div class="p-2 tooltip-inner">
				<div v-html="tooltip.title"></div>
			</div>
		</div>
	</div>
	<?php include("./includes/footer.html"); ?>
	<script src="./static/js/vue-app.min.js"></script>
	<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
</body>
</html>