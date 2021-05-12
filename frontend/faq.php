<!DOCTYPE html>
<html>

<head>
	<title>Hoaxy&reg; : FAQ</title>
	<?php include("./includes/includes.html"); ?>
</head>

<body>

	<div id="vue-app">
		<?php include("./includes/header.html"); ?>



				<!-- Currently we use vanilla js to render/view/ and change color of
			 			 elements in the faq index and faq contents. For optimization
					   when time allows, we can change this whole process using vue
					   templates as the code will be more efficient, and maintainable-->
        <section id="faq" class="container-fluid">
        	<div class="container">
        		<dl>
							<dt>FAQ Index</dt>
							<ul>
								<li v-on:click="changeFaqContentsColor('faq-q1')"
										class="mb-0 pb-0">
										<a href="#faq-q1">What is Hoaxy?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q10')"
									  class="mb-0 pb-0">
										<a href="#faq-q10">What is the difference between Article Search and Live Search?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q2')"
										class="mb-0 pb-0">
										<a href="#faq-q2">How does Article Search work?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-twitter-search')"
										class="mb-0 pb-0">
										<a href="#faq-twitter-search">How do I use advanced Twitter search terms?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q3')"
										class="mb-0 pb-0">
										<a href="#faq-q3">What is a “claim”? Who decides what is true or not?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q4')"
										class="mb-0 pb-0">
										<a href="#faq-q4">Do you have an editorial team?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q5')"
									  class="mb-0 pb-0">
										<a href="#faq-q5">What does the visualization show?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q6')"
									  class="mb-0 pb-0">
										<a href="#faq-q6">What is the bot score and how is it calculated?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q8')"
								    class="mb-0 pb-0">
										<a href="#faq-q8">What if I see some bot scores that are wrong? How can I help?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q9')"
									  class="mb-0 pb-0">
										<a href="#faq-q9">What are Trending News, Popular Claims, and Fact-Checks in the landing page panel?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q11')"
								    class="mb-0 pb-0">
										<a href="#faq-q11">How do you match claims to fact-checks?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q12')"
										class="mb-0 pb-0">
										<a href="#faq-q12">How does Hoaxy track the spread of articles?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q13')"
									  class="mb-0 pb-0">
										<a href="#faq-q13">What is the source of social media data?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q14')"
										class="mb-0 pb-0">
										<a href="#faq-q14">How do I add a Hoaxy story to my own website?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q15')"
										class="mb-0 pb-0">
										<a href="#faq-q15">Can I download the results of a story on my own computer?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q30')"
										class="mb-0 pb-0">
										<a href="#faq-q30">Can I import my own data into Hoaxy's Visualization tool?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q31')"
										class="mb-0 pb-0">
										<a href="#faq-q31">When importing files, what format does the data need to be in?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q16')"
									  class="mb-0 pb-0">
										<a href="#faq-q16">Do you access any private conversations?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q17')"
									  class="mb-0 pb-0">
										<a href="#faq-q17">Do you provide an API to the data you collect?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q18')"
										class="mb-0 pb-0">
										<a href="#faq-q18">Can I cite Hoaxy in my work?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q19')"
										class="mb-0 pb-0"><a href="#faq-q19">What technology does Hoaxy use?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q20')"
										class="mb-0 pb-0">
										<a href="#faq-q20">Is Hoaxy open source?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q21')"
										class="mb-0 pb-0">
										<a href="#faq-q21">Why am I asked to log in using my Twitter account?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q22')"
										class="mb-0 pb-0">
										<a href="#faq-q22">Who are the Hoaxy developers?</a>
								</li>
								<li v-on:click="changeFaqContentsColor('faq-q23')"
									  class="mb-0 pb-0">
										<a href="#faq-q23">How can I contact the Hoaxy team?</a>
								</li>
							</ul>

        			<dt id="faq-q1">What is Hoaxy?</dt>
        			<dd class="faq-element-contents">
        				Hoaxy is a tool that visualizes the spread of articles online. Articles can
								be found on Twitter, or in a corpus of claims and related fact checking.
        			</dd>


							<dt id="faq-q10">What is the difference between Article Search and Live
									Search?
							</dt>
							<dd class="faq-element-contents">
								There are two search modes.
                                                                <b>Article Search</b> finds claims
								and related fact checking in a limited corpus of articles from
								low-credibility and fact-checking sources, dating back to 2016. 
								This mode leverages the
								<a href="https://rapidapi.com/truthy/api/hoaxy"
									 target="_blank">Hoaxy API</a>
								to retrieve relevant articles, accounts, and
								tweets. <b>Live Search</b> lets users track articles from any
								sources posted on Twitter, but only within the last 7 days. 
								
								
								Twitter mode uses
								the
								<a href="https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets"
								target="_blank">Twitter Search API</a>
								to retrieve relevant, popular, or mixed	tweets matching your
								search query. It is compatible with all
								<a href="https://developer.twitter.com/en/docs/tweets/search/guides/standard-operators"
								target="_blank">advanced search operators</a>.
								
								At most, Hoaxy is capable of visualizing the top 1000 accounts and in the case of a Live Search, this will be the most recently active 1000 accounts if sorted by <em>Recent</em>.
							</dd>
							
        			<dt id="faq-q2">How does Article Search work?</dt>
        			<dd class="faq-element-contents">
        				The Hoaxy corpus tracks the social sharing of links to
								stories published by two types of websites: (1) Independent
								fact-checking organizations, such as snopes.com, politifact.com,
								and factcheck.org, that routinely fact check unverified claims.
								(2) Low-credibility sources in the <a href="https://iffy.news/iffy-plus/"
									 target="_blank">iffy+</a> list. These sources,
								identified by major fact-checking and journalism organizations,
								regularly publish mis/disinformation.
					</dd>
					
					

        			<dt id="faq-twitter-search">How do I use advanced Twitter search terms?</dt>
        			<dd class="faq-element-contents">
							Twitter mode uses
							the
							<a href="https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets"
							target="_blank">Twitter Search API</a>
							to retrieve relevant, popular, or mixed	tweets matching your
							search query. It is compatible with all
							<a href="https://developer.twitter.com/en/docs/tweets/search/guides/standard-operators"
							target="_blank">advanced search operators</a>. For example, instead of <code>puppy</code>  you could search for <code>puppy OR kitten</code> or <code>puppy filter:media</code>.


        			</dd>

							<dt id="faq-q3">What is a “claim”? Who decides what is true or not?</dt>
        			<dd class="faq-element-contents">
        				<u>We do <em>not</em> decide what is true or false</u>.
								Low-credibility sources often publish false news, hoaxes,
								rumors, conspiracy theories, and satire, but may also publish
								accurate reports. Therefore not all claims you can visualize on
								Hoaxy are false, nor can we track all false stories. We aren’t
								even saying that the fact checkers are 100% correct all the
								time. You can use the Hoaxy tool to observe how unverified
								stories and the fact checking of those stories spread on
								public social media. We welcome users to click on links to
								fact-checking sites to see what they’ve found in their research,
								but it’s up to you to evaluate the evidence about a claim and
								its rebuttals.
        			</dd>

							<dt id="faq-q4">Do you have an editorial team?</dt>
        			<dd class="faq-element-contents">
								No. Hoaxy tracks claims and fact checks automatically, 24/7.
								We do not read the contents of the articles we track.
								This is why we cannot establish whether a claim is accurate,
								nor whether a particular claim was verified by a particular
								fact check.
							</dd>

        			<dt id="faq-q5">What does the visualization show?</dt>
        			<dd class="faq-element-contents">
								Hoaxy visualizes two aspects of the spread of claims and
								fact checking: temporal trends and diffusion networks. Temporal
								trends plot the cumulative number of Twitter shares over time.
								The user can zoom in on any time interval. Diffusion networks
								display how claims spread from person to person. Each node is
								a Twitter account and two nodes are connected if a link to a
								story is passed between those two accounts via
								retweets, replies, quotes, or mentions. The color of a
								connection indicates the type of information: claims and fact
								checks. Clicking on an edge reveals the tweet(s) and the link
								to the shared story; clicking on a node reveals claims shared
								by the corresponding user. The network may be pruned for
								performance.
        			</dd>

							<dt id="faq-q6">What is the bot score and how is it calculated?
							</dt>
							<dd class="faq-element-contents">
								One can think of the bot score as the likely level of
								automation of an account, where a 5 may indicate a large
								amount of automation, and 0 may indicate little to no
								automation. Bot scores are calculated using a machine learning algorithm
								trained to classify the level of automation an account presents. More information
								about this topic can be found in the
								<a href="https://botometer.osome.iu.edu/#!/faq"
									 target="_blank">Botometer FAQ</a>.
							</dd>

							<dt class="faq-element" id="faq-q8">What if I see some bot scores that are wrong?
									How can I help?
							</dt>
							<dd class="faq-element-contents">
								Social bot detection is a hard problem.  We are constantly
								improving our tool’s accuracy, but there will be accounts that
								our tool fails to classify. You can assist us in making more
								accurate classifications. You might recognize your own account.
								Or you might have information that allows you to recognize some
								other account as most likely human or bot. In these cases,
								you can provide feedback on those accounts. Do this by
								clicking on the account (node) and
								then the Feedback button. Feedback helps us better
								distinguish between humans, bots, and everything in between,
								so your help is greatly appreciated.
							</dd>

							<dt id="faq-q9">What are Trending News, Popular Claims, and Fact-Checks in
								the landing page panel?
							</dt>
							<dd class="faq-element-contents">
								The landing page panel provides shortcuts to search for new
								and relevant articles. Trending News are top and breaking
								headlines for the United States. Popular Claims are the
								articles from low-credibility sources most tweeted in the last
								month. Similarly, Popular Fact-Checks are the most tweeted
								articles in the last month published by fact-checking
								organizations.
							</dd>

        			<dt id="faq-q11">How do you match claims to fact-checks? </dt>
        			<dd class="faq-element-contents">
								We use search engine technology (think of Google) to
								retrieve claims and fact checks. The user enters a query and
								we match it against our index of claims to find relevant
								articles. We perform the same procedure to find fact checks
								matching the query. The user can select claims and
								fact-checking articles to be visualized.
        			</dd>

        			<dt id="faq-q12">How does Hoaxy track the spread of articles?</dt>
        			<dd class="faq-element-contents">
								We collect public tweets that include links to stories.
								We then fetch the page linked in the tweet and store the URL
								and the text of the page of the article, adding them to our
								corpus together with the tweet. When the user submits a query
								in Article Search mode, we match the most relevant or recent
								articles (claims and fact checks) and select all the tweets
								that linked to them.
        			</dd>


        			<dt id="faq-q13">What is the source of social media data?</dt>
        			<dd class="faq-element-contents">
        				At the moment we only collect data from Twitter.
        			</dd>

							<dt id="faq-q14">How do I add a Hoaxy story to my own website?</dt>
        			<dd class="faq-element-contents">
								Click the “Embed” button at the bottom of the middle
								navigation menu. Then, copy the code in the popup and paste
								it into the body of your site’s html code or in the platform
								you are using as directed by that platform. What will be
								visible on your site or platform is a widget that should look
								similar to the one in the popup.
        			</dd>

					<dt id="faq-q15">Can I download the results of a story on my own computer?</dt>
        			<dd class="faq-element-contents">
								Yes! Click the “Export” button, found at the bottom of the
								middle navigation menu.  This should download or ask you
								permission to download a comma separated values (CSV) file.
								Each row in the file represents a connection in the
								visualization and can be thought of as a tweet. The columns
								correspond to the features of the tweet, e.g., who posted it,
								who was mentioned, when the tweet was published, etc.
					</dd>
					
					<dt id="faq-q30">Can I import my own data into Hoaxy's Visualization tool?</dt>
        			<dd class="faq-element-contents">
								Yes! Instead of searching for a specific query, click the "Import Data" button.  From there, you can upload a CSV or JSON file containing Tweet information.  This works best with data exported directly from a previous Hoaxy query, however, correctly formatted files can be used regardless of source.
					</dd>
					
					<dt id="faq-q31">When importing files, what format does the data need to be in?</dt>
        			<dd class="faq-element-contents">
								Hoaxy can visualize CSV and JSON files as long as the data is formatted correctly.  While this works best with data exported directly from a Hoaxy query, any data using the columns or field names found in the exported files should work.
        			</dd>


        			<dt id="faq-q16">Do you access any private conversations?</dt>
        			<dd class="faq-element-contents">
        				No, we only access public tweets.
        			</dd>


        			<dt id="faq-q17">Do you provide an API to the data you collect?</dt>
        			<dd class="faq-element-contents">
        				Yes, check out the free
								<a href="https://rapidapi.com/truthy/api/hoaxy"
								   target="_blank">Hoaxy API</a>
							  available on Rapid API.
        			</dd>


        			<dt id="faq-q18">Can I cite Hoaxy in my work?</dt>
        			<dd class="faq-element-contents">
								Yes, if you use Hoaxy for your work then please cite the
								following articles:
        				<br />
								<br />
								<p>[1] Chengcheng Shao, Pik-Mai Hui, Lei Wang, Xinwen Jiang,
									 Alessandro Flammini, Filippo Menczer, Giovanni Luca Ciampaglia
									 (2018). Anatomy of an online misinformation network. PLOS
									 ONE, e0196087. https://doi.org/10.1371/journal.pone.0196087
								</p>

								<p>[2] Chengcheng Shao, Giovanni Luca Ciampaglia, Onur Varol, Kaicheng Yang, 
									 Alessandro Flammini, and Filippo Menczer (2018). The spread
									 of low-credibility content by social bots.  Nature Communications,
									 9:4787. https://doi.org/10.1038/s41467-018-06930-7
								</p>

								<p>[3] Chengcheng Shao, Giovanni Luca Ciampaglia, Alessandro
									 Flammini, and Filippo Menczer (2016). Hoaxy: A Platform for
									 Tracking Online Misinformation. In Proceedings of the 25th
									 International Conference Companion on World Wide Web
									 (WWW '16 Companion), pp. 745-750.
									 http://doi.org/10.1145/2872518.2890098
								</p>
      				</dd>


        				<dt id="faq-q19">What technology does Hoaxy use?</dt>
        				<dd class="faq-element-contents">
									Hoaxy is written primarily in Python. On the back-end we
									use Apache Lucene (for full-text indexing and retrieval),
									Scrapy (for web crawling), Apache Tika
									(for metadata extraction), RSS (for feed aggregation),
									PostgreSQL (for data indexing and storage), and SQLAlchemy
									(for object-relational mapping). On the front-end we use
									Javascript, Bootstrap, NV.D3 (for the chart), and Sigma-js
									(for the network). We collect data from Twitter using the
									<a href="https://developer.twitter.com/en/docs/tweets/filter-realtime/overview"
									   target="_blank">Filter API</a>.
									Top trending articles in the dashboard of the landing page
									are powered by the
									<a href="https://newsapi.org/"
										 target="_blank">News API</a>.
								</dd>


        				<dt id="faq-q20">Is Hoaxy open source?</dt>
        				<dd class="faq-element-contents">
									Yes. This makes it possible for colleagues, fact checkers,
									and reporters around the world to deploy versions of the
									tool to map the spread of claims from their own sources,
									in their own countries and languages. The code is available
									in two repositories: a
									<a href="https://github.com/IUNetSci/hoaxy-backend"
										 target="_blank">backend</a>
									and a
									<a href="https://github.com/IUNetSci/hoaxy-frontend"
										 target="_blank">frontend</a>.
									Please contact
									<a href="https://osome.iu.edu/contact/"
										 target="_blank">us</a>
									to let us know if you are using our code.
        				</dd>

								<dt id="faq-q21">Why am I asked to log in using my Twitter account?</dt>
	        			<dd class="faq-element-contents">
									To retrieve search results from the Twitter API on your
									behalf. We also seek your permission to connect to the Twitter
									API if you want to refresh the bot scores in the
									visualization. This is needed to fetch the data needed to
									recompute the scores on your behalf. We do not store your
									Twitter personal information, nor do we use any permissions
									or data to do anything beyond what is necessary to provide
									the Hoaxy service. More information can be found on the
									<a href="https://botometer.osome.iu.edu/#!/faq"
										 target="_blank">Botometer FAQ</a>.
	        			</dd>

        				<dt id="faq-q22">Who are the Hoaxy developers?</dt>
        				<dd class="faq-element-contents">
        					Hoaxy is a joint project of the Indiana University Network
									Science Institute
									(<a href="https://iuni.iu.edu/"
											target="_blank">IUNI</a>)
									and the Center for Complex Networks and Systems Research
									(<a href="http://cnets.indiana.edu/"
										  target="_blank">CNetS</a>).
									<a href="http://cnets.indiana.edu/fil/"
										 target="_blank">Filippo Menczer</a>,
									 <a href="http://cnets.indiana.edu/aflammin/"
											target="_blank">Alessandro Flammini</a>,
									and
									<a href="http://www.glciampaglia.com/"
										 target="_blank">Giovanni Luca Ciampaglia</a>
								  coordinate the project. Other past or current team members include
									<a href="http://shaochengcheng.github.io/"
									   target="_blank">Chengcheng Shao</a>,
								 	<a href="https://pages.iu.edu/~mavram/"
										 target="_blank">Mihai Avram</a>,
									<a href="http://iuni.iu.edu/people/person/ben-serrette"
										 target="_blank">Ben Serrette</a>,
								  <a href="http://iuni.iu.edu/people/person/valentin-pentchev"
										 target="_blank">Valentin Pentchev</a>,
									<a href="https://www.linkedin.com/in/lei-wang-ba679483?trk=hp-identity-name"
									   target="_blank">Lei Wang</a>,
									<a href="https://www.linkedin.com/in/gregory-maus-016b021b"
									   target="_blank">Gregory Maus</a>,
									<a href="http://www.liangdesigner.com/"
									   target="_blank">Liang Chen</a>,
								  <a href="http://www.onurvarol.com/"
									   target="_blank">Onur Varol</a>,
									<a href="http://www.clayadavis.net/"
										target="_blank">Clayton Davis</a>,
									<a href="http://www.kaichengyang.me/"
										target="_blank">Kaicheng Yang</a>,
									<a href="http://iuni.iu.edu/about/people/person/chathuri-peli-kankanamalage"
										target="_blank">Chathuri Peli Kankanamalage</a>,
									<a href="http://iuni.iu.edu/about/people/person/marc_mccarty"
										target="_blank">Marc McCarty</a>,
									and
									<a href="http://iuni.iu.edu/people/person/sarah_beverton"
										target="_blank">Sarah Beverton</a>.
									We are members of the of
									<a href="https://firstdraftnews.com/academic-partners/"
									   target="_blank">First Draft Academic Partner Network</a>.
									The project is supported by a
									<a href="https://www.democracyfund.org/blog/entry/20-projects-receive-funding-to-combat-misinformation-and-build-a-more-trust"
										 target="_blank">Knight Prototype</a>
									grant from the
									<a href="https://www.democracyfund.org/"
									   target="_blank">Democracy Fund</a>.
        				</dd>

								<dt id="faq-q23">How can I contact the Hoaxy team?</dt>
								<dd class="faq-element-contents">
									The best way to contact the team is by using the
									<a href="https://osome.iu.edu/contact/"
										 target="_blank">contact information</a>
									found at the OSoMe website. You can also tweet us at
									<a href="https://twitter.com/OSoMe_IU"
										 target="_blank">@OSoMe_IU</a>
									but we cannot promise to monitor Twitter at all times.
								</dd>

        			</dl>
        		</div>

        </section>

	</div>



	<script>
	// $("#faq dt").each(function(){
	// 			var dt = $(this);
	// 			var t = dt.text();
	// 			dt.empty();
	// 			var id = t.replace("Q: ", "").replace("?", "").replace(/[^\w]/g, "_");
	// 			var new_content = "";
	// 			new_content = "<a href='#" + id + "' id='" + id + "'>";
	// 			new_content += t;
	// 			new_content += "</a>";
	// 			dt.html(new_content);
	// 		});
	var defaultProfileImage = "static/assets/Twitter_logo_blue_32-cropped.png";
	var app = new Vue({

		el: '#vue-app',
		data:{
			
			show_tutorial_link: undefined,
			tutorial: false,
			menu_open: false,

			twitter: false,
			
			profile:
			{
				name: "",
				image: defaultProfileImage
			},
		},
		methods: {
            show_tutorial: function(){
				document.cookie="HideHoaxyTutorial=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                location.href = "./";
            },
						changeFaqContentsColor: function(faqElement) {
							// Resetting all faq content elements to have an inherited
							// background color
							faqElements =
								document.getElementsByClassName('faq-element-contents');
					    for (var i = 0; i < faqElements.length; i++) {
					        faqElements[i].style.backgroundColor="inherit";
					    }
							// Changing the background color of the focused faq element
							document.getElementById(faqElement)
								.nextElementSibling
								.style.backgroundColor = 'rgb(204, 212, 226)';
						}
		},
		mounted: function(){
		}
	});

	</script>
	<?php include("./includes/footer.html"); ?>
	<script>
		/*
	var updateSubtitle = function(){
		var subtitle = document.getElementById("hoaxy_subtitle");
		var content = subtitle.innerHTML;
		content = content.split(" ");
		for(var i in content)
		{
			if(content[i] == "Hoaxy")
			{
				content[i] += "&reg;";
			}
		}
		subtitle.innerHTML = content.join(" ");
	}();
	*/

	</script>
</body>
</html>
