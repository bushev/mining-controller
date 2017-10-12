{% extends 'app/views/admin/layout.swig' %}

{% block title %}View rig{% endblock %}

{% block pageheader %}
  {{ pageheader({title: 'Rigs management - view rig', showEditButton: true, showCloseButton: true}) }}
{% endblock %}

{% block pagecontent %}
  {% include 'app/views/admin/partials/table-row.swig' %}
  <div class="row">
    <div class="col-sm-12">
      <h1>
        {{ item.name }}
        <small>{{ item.ipAddress }}</small>
      </h1>
      <div class="row">
        <div class="col-md-7">
          <table class="table table-striped">
            <tbody>
            {#{{ tableRow(item, 'name') }}#}
            {#{{ tableRow(item, 'mac', 'MAC') }}#}
            {#{% if item.lastTrack %}#}
              {#<tr>#}
                {#<th scope="row">Last seen</th>#}
                {#<td>{{ moment(item.lastTrack.createdAt).calendar().toLowerCase() }}</td>#}
              {#</tr>#}
              {#{{ tableRow(item.lastTrack, 'latitude') }}#}
              {#{{ tableRow(item.lastTrack, 'longitude') }}#}
              {#{{ tableRow(item.lastTrack, 'altitude') }}#}
              {#{{ tableRow(item.lastTrack, 'assurance') }}#}
              {#{{ tableRow(item.lastTrack, 'speed') }}#}
              {#{{ tableRow(item.lastTrack, 'motion') }}#}
              {#{{ tableRow(item.lastTrack, 'temperature') }}#}
            {#{% endif %}#}
            {#{{ tableRow(item, 'battery') }}#}
            {#{{ tableRow(item, 'firmware') }}#}
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