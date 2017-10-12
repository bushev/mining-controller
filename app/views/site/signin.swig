{% extends 'layout.swig' %}

{% block content %}

  <div class="row">
    <div class="col-md-6 col-md-offset-3">
      <div class="panel panel-default">
        <div class="panel-body">
          <form action="/signin" method="post">
            <div class="row">
              <div class="form-group">
                <div class="col-md-12">
                  <label for="username">E-mail</label>
                  <input type="email" class="form-control input-lg" id="username" name="username" required>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="form-group">
                <div class="col-md-12">
                  <label for="password">Password</label>
                  <input type="password" class="form-control input-lg" id="password" name="password" required>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <hr>
                <input type="submit" value="Sign in" class="btn btn-primary pull-right">
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

{% endblock %}
