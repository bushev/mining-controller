{% extends 'layout.swig' %}

{% block content %}

  <div class="row">
    <div class="col-md-6 col-md-offset-3">
      <div class="panel panel-default">
        <div class="panel-body">
          <form action="/signup" method="post">
            <div class="row">
              <div class="form-group">
                <div class="col-md-12">
                  <label for="email">E-mail</label>
                  <input type="email" class="form-control input-lg" id="email" name="email" required>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="form-group">
                <div class="col-md-12">
                  <label for="firstName">First Name</label>
                  <input type="text" class="form-control input-lg" id="firstName" name="firstName" required>
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
              <div class="form-group">
                <div class="col-md-12">
                  <label for="passwordConfirmation">Password Confirmation</label>
                  <input type="password" class="form-control input-lg" id="passwordConfirmation"
                         name="passwordConfirmation" required>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <hr>
                <input type="submit" value="Sign up" class="btn btn-primary pull-right">
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

{% endblock %}
