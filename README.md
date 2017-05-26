# Disclaimer

The name Hoaxy is a trademark of Indiana University. Neither the name "Hoaxy" nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

# Hoaxy frontend

The is the frontend of [Hoaxy](http://hoaxy.iuni.iu.edu), and it is intended to be used in conjunction with an implementation of the Hoaxy backend platform, which is available at: 

    http://github.com/iunetsci/hoaxy-backend

For more information, including a description of the application and information on how to collaborate with the Hoaxy team, please visit [the official Hoaxy website](http://hoaxy.iuni.iu.edu).

## Requirements

### Templating and Server

Header, Footer, and Global Includes are located under `/includes/`.

This site uses [Server Side Includes (SSI)](http://httpd.apache.org/docs/current/howto/ssi.html) to handle the header and footer. SSIs are built into Apache, but may need to be enabled.  As such, we recommend running this on an Apache server. More research may be required to utilize SSIs on non-Apache servers. Other methods of including the required files (such as the Flask templates) may require slight modifications of the code or installation of additional libraries. In the event that using SSIs is impractical or impossible, you should copy the code from the include files directly into `index.html` and `stats.html`.

### Dependencies

The JavaScript dependencies are listed in `includes/includes.html`.  Most libraries are included via CDNs except for two Sigma.js plugins which are located in `static/sigmaplugins`.

* [JQuery](http://jquery.com/)
* [JQuery UI](http://jqueryui.com/)
* [Underscore](http://underscorejs.org/)
* [Bootstrap 4](http://v4-alpha.getbootstrap.com/)
* [Prybar](https://github.com/clayadavis/prybar)
* [sigma.js](http://sigmajs.org/)
* [D3](https://d3js.org/)
* [NV.D3](http://nvd3.org/)

The graph visualization uses Sigma.js, and it was tested with v1.1.0. The timeline chart is implemented using NV.D3, a plugin for D3.js, and it was tested with NV.D3 v1.8.1 and D3 v3.5.17. Feel free to use more recent versions at your own risk.

### Configuration

API endpoints must be defined in a `config.js` file placed in the root directory.  An example config file - `config.example.js` - has been provided to show you the correct format.  It features endpoints from the [public Hoaxy Mashape API](https://market.mashape.com/truthy/hoaxy).  These endpoints should be modified to point to your own implementation of the [Hoaxy Backend](https://github.com/IUNetSci/hoaxy-backend).
