<!DOCTYPE html>
<html>

<head>
	<title>Hoaxy&reg; : Dashboard</title>
	<?php include("./includes/includes.html"); ?>
</head>

<body>
	<div id="vue-app">
		<?php include("./includes/header.html"); ?>
		<div id="spinner" v-if="loading" v-bind:class="{'transparent':mounted}">
			<span class="fa"><i class="fa" :class="'fa-hourglass-' + spinner_state" :style="'transform: rotate('+spinner_rotate+'deg)'" aria-hidden="true"></i></span>
		</div>

		<nav class="container_fluid tab_container">
			<ul class="nav nav-tabs container" role=tablist >
				<li class="nav-item">
					<a class="nav-link" :class="{'active':active_tab == 'popular_articles'}" href="#popular_articles" role="tab" @click="active_tab = 'popular_articles'">Popular Articles</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" :class="{'active':active_tab == 'influential_users'}" href="#influential_users" role="tab" @click="active_tab = 'influential_users'">Influential Accounts</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" :class="{'active':active_tab == 'active_users'}" href="#active_users" role="tab" @click="active_tab = 'active_users'">Active Accounts</a>
				</li>
			</ul>
		</nav>
		<div class="tab-content">

			<section class="tab-pane active container-fluid" v-if="active_tab=='popular_articles'" role="tabpanel" id="">
				<div class="row">
					<div class="col-md-6" v-for="(articles, type) in popular_articles">
						<p>Most popular <span class="">{{formatArticleType(type)}}</span> in the last month</p>
						<div class="table-responsive" :id="'popular_articles_'+type">
							<table class="table table-striped">
								<tr>
									<th>Capture date</th>
									<th>Title</th>
									<th>Tweets</th>
								</tr>
								<tr v-for="article in articles">
									<td>{{article.capture_date}}</td>
									<!-- <td><a :href="article.canonical_url" rel="noreferrer noopener" target="_blank">{{article.title}}</a></td> -->
									<td><a :href="createSearchUrl(article.title)">{{article.title}}</a></td>
									<td>{{article.number_of_tweets}}</td>
								</tr>
								<tr v-if="articles.length == 0">
									<td colspan="3">Could not find any articles</td>
								</tr>
							</table>
						</div>
					</div>

					</div>
				</div>
			</section>


			<section class="tab-pane container-fluid" role="tabpanel" id="" v-if="active_tab=='influential_users'">
				<div class="row">
					<div class="col-md-6" v-for="(spreaders, type) in influential_users">
						<p>Most influential accounts sharing <span class="">{{formatArticleType(type)}}</span> in the last month</p>
						<div class="table-responsive" :id="'influential_users_' + type">
							<table class="table table-striped">
								<tr>
									<th>Screen Name</th>
									<th>Number of Tweets</th>
									<th>Botometer Score</th>
								</tr>
								<tr v-for="spreader in spreaders">
									<td><a rel="noreferrer noopener" target="_blank" :href="'https://twitter.com/' + spreader.user_screen_name">{{spreader.user_screen_name}}</a></td>
									<td>{{spreader.number_of_tweets}}</td>
									<td><a rel="noreferrer noopener" target="_blank" :href="'https://botometer.iuni.iu.edu/#!/?sn=' + spreader.user_screen_name">{{spreader.bot_percent}}</a></td>
								</tr>
								<tr v-if="spreaders.length == 0">
									<td colspan="3">Could not find any accounts</td>
								</tr>
							</table>
						</div>
					</div>
				</div>
			</section>


			<section class="tab-pane container-fluid" role="tabpanel" id="" v-if="active_tab=='active_users'" >
				<div class="row">
                    <div class="col-md-6" v-for="(spreaders, type) in active_users">
						<p>Most active accounts sharing <span class="">{{formatArticleType(type)}}</span> in the last month</p>
						<div class="table-responsive" :id="'influential_users_' + type">
							<table class="table table-striped">
								<tr>
									<th>Screen Name</th>
									<th>Number of Tweets</th>
									<th>Botometer Score</th>
								</tr>
								<tr v-for="spreader in spreaders">
									<td><a rel="noreferrer noopener" target="_blank" :href="'https://twitter.com/' + spreader.user_screen_name">{{spreader.user_screen_name}}</a></td>
									<td>{{spreader.number_of_tweets}}</td>
									<td><a rel="noreferrer noopener" target="_blank" :href="'https://botometer.iuni.iu.edu/#!/?sn=' + spreader.user_screen_name">{{spreader.bot_percent}}</a></td>
								</tr>
								<tr v-if="spreaders.length == 0">
									<td colspan="3">Could not find any accounts</td>
								</tr>
							</table>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>



	<script>

	var app = new Vue({

		el: '#vue-app',
		data:{
			active_tab: "popular_articles",
			mounted: false,

			tutorial: false,
			twitter: false,

			popular_articles: {
				claim: [],
				fact_checking: [],
			},
			active_users: {
				claim: [],
				fact_checking: [],
			},
			influential_users: {
				claim: [],
				fact_checking: [],
			},

			//for loading screen
			spin_counter: 0,
			loading: true,
			spin_timer: null,
			spinner_state: 0,
			spinner_rotate: 0,

			show_tutorial_link: undefined,
            menu_open: false
		},
		methods: {
			formatArticleType: function(type){
				if(type == "claim")
					return "claims";
				if(type == "fact_checking")
					return "fact checking articles"
				return "";
			},
			createSearchUrl: function(title){
				return "./#query=" + encodeURIComponent(title) + "&sort=relevant&type=Hoaxy"
			},
			getArticles: function(){
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
						var local_popular_articles = {
							claim: [],
							fact_checking: [],
						};
						for(var i in articles)
						{
							var a = articles[i];
							a.capture_date = a.date_captured.split('T')[0];
							local_popular_articles[a.site_type].push(a);
						}
						v.popular_articles = local_popular_articles;
						v.spinStop();
					},
					function (error) {
						alert("Get Articles Request failed: " + error.response.statusText);
						v.spinStop();
					}
				);
			},
            getUsers: function(){
                this.spinStart();
                var v = this;
                var request = axios.get( configuration.top_users_url, {
                    headers: configuration.top_users_headers,
                    dataType: 'json'
                });

				request.then(
					function(response){
						response = response.data;
						var spreaders = response.spreaders;
						var local = {
							active: {
								claim: [],
								fact_checking: []
							},
							influential: {
								claim: [],
								fact_checking: []
							}
						};
						for(var i in spreaders)
						{
							var a = spreaders[i];
							var bot_percent = "";
							if(a.bot_score === null)
							{
								bot_percent = "n/a";
							}
							else
							{
								bot_percent = a.bot_score * 100;
                                bot_percent = bot_percent * .05;
                                bot_percent = bot_percent.toFixed(1);
								// bot_percent = bot_percent.toFixed() + '%';
							}
							a.bot_percent = bot_percent;
							local[a.spreading_type][a.site_type].push(a);
						}
						v.active_users = local.active;
						v.influential_users = local.influential;
						v.spinStop();
					},
					function (error) {
						alert("Get Spreaders Request failed: " + error.response.statusText);
						v.spinStop();
					}
				);
			},
			activate_tab: function(tab_name){
				this.active_tab = tab_name;
			},
	        spinStop: function(reset){
	        	this.spin_counter --;
	        	if(reset === true)
	        	{
	        		this.spin_counter = 0;
	        	}

	        	if(this.spin_counter <= 0)
	        	{
	        		this.loading = false;
	        		clearTimeout(this.spin_timer);
	        		this.spin_timer = null;
	        	}

	        },
	        spinStart: function(){
	        	this.spin_counter ++;
	        	this.loading = true;
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
	        	}, 90000);
	        },
			show_tutorial: function(){
    				document.cookie="HideHoaxyTutorial=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                    location.href = "./";
                }
		},
		mounted: function(){
			var v = this;

	        this.mounted = true;
	        this.spinStop(true);
	        this.show_articles = false;
	        this.show_graphs = false;

	        //create hourglass loading spinner
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

			var active_tab = location.hash.replace("#", "");
			if(active_tab)
			{
				this.active_tab = active_tab;
			}

			this.getArticles();
			this.getUsers();

		}
	});

	</script>
	<?php include("./includes/footer.html"); ?>
</body>
</html>
