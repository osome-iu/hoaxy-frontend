
var app = new Vue({
    el: '#vue-app',
    data: {
        loading: true,
        mounted: false,
        show_articles: false,
        show_graphs: false,
        show_zoom_buttons: false
    },
    methods: {
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
