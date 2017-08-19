import React from 'react'
import { renderToString } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import routes from './modules/routes'

var express = require('express')
var path = require('path')
var compression = require('compression')

var app = express()

// must be first!
app.use(compression())

app.use(express.static(path.join(__dirname, 'public')))

app.get('*', (req, res) => {
  match({ routes: routes, location: req.url }, (err, redirect, props) => {
    // in here we can make some decisions all at once
    if (err) {
      // there was an error somewhere during route matching
      res.status(500).send(err.message)
    } else if (redirect) {
      // we haven't talked about `onEnter` hooks on routes, but before a
      // route is entered, it can redirect. Here we handle on the server.
      res.redirect(redirect.pathname + redirect.search)
    } else if (props) {
    	// `RouterContext` is what the `Router` renders. `Router` keeps these
	    // `props` in its state as it listens to `browserHistory`. But on the
	    // server our app is stateless, so we need to use `match` to
	    // get these props before rendering.
	    // 
      // if we got props then we matched a route and can render
      const appHtml = renderToString(<RouterContext {...props}/>)
      // dump the HTML into a template, lots of ways to do this, but none are
	    // really influenced by React Router, so we're just using a little
	    // function, `renderPage`
      res.send(renderPage(appHtml))
    } else {
      // no errors, no redirect, we just didn't match anything
      res.status(404).send('Not Found')
    }
  })
})

function renderPage(appHtml) {
  return `
    <!doctype html public="storage">
    <html>
    <meta charset=utf-8/>
    <title>My First React Router App</title>
    <link rel=stylesheet href=/index.css>
    <div id=app>${appHtml}</div>
    <script src="/bundle.js"></script>
   `
}

var PORT = process.env.PORT || 8080
app.listen(PORT, function() {
  console.log('Production Express server running at localhost:' + PORT)
})