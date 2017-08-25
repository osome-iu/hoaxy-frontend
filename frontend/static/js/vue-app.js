
var app = new Vue({
    el: '#vue-app',
    data: {
        loading: true,
        mounted: false,
        show_articles: false,
        show_graphs: false
    },
    mounted: function(){
        this.mounted = true;

        console.debug("Vue Mounted.");
    }
});
