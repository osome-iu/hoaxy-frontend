
var app = new Vue({
    el: '#vue-app',
    data: {
        loading: true,
        mounted: false
    },
    mounted: function(){
        this.mounted = true;

        console.debug("Vue Mounted.");
    }
});
