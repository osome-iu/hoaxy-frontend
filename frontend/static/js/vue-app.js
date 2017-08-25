var max_articles = 20;

var app = new Vue({
    el: '#vue-app',
    data: {

        loading: true,
        mounted: false,
        show_articles: false,
        show_graphs: false,
        show_zoom_buttons: false,
        articles: [],
        articles_to_show: max_articles
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
        }
    },
    mounted: function(){
        this.mounted = true;

        console.debug("Vue Mounted.");
    }
});
