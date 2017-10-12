<!DOCTYPE html>
<html>
<head>

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">

  <title>{{ title }}</title>

  <meta name="keywords" content=""/>
  <meta name="description" content="">
  <meta name="author" content="LuxCarBuyers">

  <link rel="shortcut icon" href="/img/favicon.ico" type="image/x-icon"/>
  <link rel="apple-touch-icon" href="/img/apple-touch-icon.png">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    [ng\:cloak], [ng-cloak], .ng-cloak {
      display: none !important;
    }
  </style>

  <link href="//fonts.googleapis.com/css?family=PT+Sans:400,700&subset=latin,cyrillic" rel="stylesheet">
  <link href="//fonts.googleapis.com/css?family=Roboto+Slab:700,400&subset=latin,cyrillic" rel="stylesheet">
  <link href="/stylesheets/site_build.css?v={{ globalConfig.appVersion }}" rel="stylesheet" type="text/css">

</head>
<body>
<div class="body">
  <div growl></div>

  <div class="container">
    <div class="header clearfix">
      <nav>
        <ul class="nav nav-pills pull-right">
          <li role="presentation" {% if currentUrl === '/' %}class="active"{% endif %}>
            <a href="/">Home</a>
          </li>

          {% if loggedUser %}
            <li role="presentation"><a href="/admin">AdminUI</a></li>
            <li role="presentation"><a href="/logout">Logout</a></li>
          {% else %}
            <li role="presentation" {% if currentUrl === '/signin' %}class="active"{% endif %}>
              <a href="/signin">Sign In</a>
            </li>
            {#<li role="presentation" {% if currentUrl === '/signup' %}class="active"{% endif %}>#}
              {#<a href="/signup">Sign Up</a>#}
            {#</li>#}
          {% endif %}

        </ul>
      </nav>
      <h3 class="text-muted">Controller</h3>
    </div>
  </div>

  <div role="main" class="main container">

    {% if flashMessages.length > 0 %}
      <div class="row">
        <div class="col-xs-10 col-xs-offset-1">
          {% include "../common/partials/messages.swig" %}
        </div>
      </div>
    {% endif %}

    {% block content %}{% endblock %}
  </div>

  <div class="container">
    <footer class="footer">
      <p>&copy; 2017 Controller project.</p>
    </footer>
  </div>

</div>

<script src="/javascripts/site_build.js?v={{ globalConfig.appVersion }}"></script>

{% block scripts %}{% endblock %}
</body>

</html>