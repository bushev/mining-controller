{% extends 'app/views/admin/layout.swig' %}

{% block title %}View user{% endblock %}

{% block pageheader %}
  {{ pageheader({title: 'User management - view user', showEditButton: true, showCloseButton: true}) }}
{% endblock %}

{% block pagecontent %}
  {% include 'app/views/admin/partials/table-row.swig' %}
  <div class="row">
    <div class="col-sm-12">
      <h1>
        {{ item.email }}
        <small>{{ item.id }}</small>
      </h1>
      <div class="row">
        <div class="col-md-7">
          <table class="table table-striped">
            <tbody>
            {{ tableRow(item, 'email', 'E-mail') }}
            {{ tableRow(item, 'status', 'Status') }}
            {{ tableRow(item, 'phone', 'Phone') }}
            <tr>
              <th scope="row">Created</th>
              <td>{{ moment(item.createdAt).calendar().toLowerCase() }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="col-md-5">
          <pre>{{ item | json(2) }}</pre>
        </div>
      </div>
    </div>
  </div>
{% endblock %}