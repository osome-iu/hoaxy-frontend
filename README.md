# Disclaimer

The name Hoaxy is a trademark of Indiana University. Neither the name "Hoaxy" nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

# Deployment

There are two primary branches in this repository.  The `master` branch is the generic, unbranded version of the frontend.  `deployment` features branding, styles, and customizations featured only on the official website.  `master` should be merged into `deployment` when new features have been added.  `deployment` should **never** be merged into `master`, and as such, should only include additions specific to the live site.

More details regarding the deployment of the Hoaxy frontend to the official site at http://hoaxy.iuni.iu.edu can be found in the [DEPLOYMENT_README.md](https://github.com/IUNetSci/hoaxy-frontend/blob/deployment/DEPLOYMENT_README.md) file in the `deployment` branch of this repository.

# Hoaxy frontend

This is the frontend of [Hoaxy](http://hoaxy.iuni.iu.edu), and it is intended to be used in conjunction with an implementation of the Hoaxy backend platform, which is available at: http://github.com/iunetsci/hoaxy-backend

We strongly recommend that you implement the Hoaxy backend before this frontend. For more information, including a description of the application and information on how to collaborate with the Hoaxy team, please visit [the official Hoaxy website](http://hoaxy.iuni.iu.edu).

## Requirements

### Templating and Server

Header, Footer, and Global Includes are located under `/includes/`.

This site uses PHP to handle templating, which is available by default on many apache servers.

### Dependencies

The JavaScript dependencies are listed in `includes/includes.html`.  Many  libraries are included via CDNs.


* [Vue.js](https://vuejs.org/)
* [Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/introduction/)
* [ES6-Promise](https://github.com/stefanpenner/es6-promise)
* [axios](https://github.com/mzabriskie/axios)
* [Moment.js](http://momentjs.com/)
* [Font Awesome 4](https://fontawesome.com/v4.7.0/)
* [sigma.js](http://sigmajs.org/)
* [D3](https://d3js.org/)
* [NV.D3](http://nvd3.org/)

The graph visualization uses Sigma.js, and it was tested with v1.2.0. The timeline chart is implemented using NV.D3, a plugin for D3.js, and it was tested with NV.D3 v1.8.1 and D3 v3.5.17. Feel free to use more recent versions at your own risk.

### Configuration

API endpoints must be defined in a `frontend/config.js`.  An example config file - `config.example.js` - has been provided to show you the correct format.  It features endpoints from the [public Hoaxy Mashape API](https://market.mashape.com/truthy/hoaxy).  These endpoints should be modified to point to your own implementation of the [Hoaxy Backend](https://github.com/IUNetSci/hoaxy-backend).
