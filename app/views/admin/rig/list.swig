{% extends 'app/views/admin/layout.swig' %}

{% block title %}Devices{% endblock %}

{% block pageheader %}
  {{ pageheader({title: 'Rigs'}) }}
{% endblock %}

{% block pagecontent %}

  <div class="row">
    <div class="col-sm-3">
      <p>
        <a href="{{ createActionUrl }}" class="btn btn-success btn-block btn-create-msg">Create new</a>
      </p>

      <div class="search-filters">
        {{ search() }}

        <br>

        {% include './partials/search-by-status.swig' %}
        {{ searchByDeviceStatus() }}

        {{ search_buttons() }}
      </div>
      <br/>

    </div>

    <div class="col-sm-9">
      <div class="msg-header">
        <div class="pull-right">
          <h5 class="sm-title text-right">{{ pagination_summary() }}</h5>
          {{ pagination_pages() }}
        </div>

        {{ bulk_actions({check: true, bulkDelete: true}) }}

      </div>

      <div class="list-group media-list msg-list">
        <div class="list-group-item list-group-sorting">
          <div class="">
            Sort by:
            {{ sorting_column({title: 'Created', field: 'createdAt'}) }}
            {{ sorting_column({title: 'Name', field: 'name'}) }}
            {{ sorting_column({title: 'IP Address', field: 'ipAddress'}) }}
            {{ sorting_column({title: 'Power PIN', field: 'powerPin'}) }}
          </div>
        </div>

        {% for item in items %}
          {% set editActionUrl = baseUrl + '/' + item.id + '/edit' %}
          {% set viewActionUrl = baseUrl + '/' + item.id %}
          {% set deleteActionUrl = baseUrl + '/' + item.id + '/delete' %}
          {% set startActionUrl = baseUrl + '/' + item.id + '/start' %}
          {% set shutdownActionUrl = baseUrl + '/' + item.id + '/shutdown' %}
          {% set rebootActionUrl = baseUrl + '/' + item.id + '/reboot' %}

          <div class="list-group-item">

            {{ item_select_checkbox() }}

            <div class="list-group-item-body">
              <div class="pull-right media-option clearfix">

                <div class="text-right">

                  {% if item.status === 'running' %}
                    <div class="label label-info">{{ item.totalSpeed }} Mh/s</div>
                    <div class="label label-success">Running</div>
                  {% elseif item.status === 'stopped' %}
                    <div class="label label-default">Stopped</div>
                  {% endif %}

                  {{ resource_action_buttons({
                    viewActionUrl: viewActionUrl,
                    editActionUrl: editActionUrl,
                    deleteActionUrl: deleteActionUrl}) }}

                  {% if item.lastReportReceivedAt %}
                    <p class="help-block">
                      <small>
                        Report
                        received {{ moment(item.lastReportReceivedAt).utcOffset('+03:00').calendar().toLowerCase() }}
                      </small>
                    </p>
                  {% endif %}

                  <div class="label label-default">ETH: {{ item.ethAddress }}</div>

                  {% if item.restarts.length > 0 %}
                    <p class="help-block">
                      <small class="text-danger">
                        Restarted {{ moment(item.restarts[item.restarts.length - 1].restartedAt).utcOffset('+03:00').calendar().toLowerCase() }}
                      </small>
                    </p>
                  {% endif %}

                </div>

              </div>
              <a href="{{ viewActionUrl }}">
                <h4 class="sender">
                  {{ item.name }}
                </h4>
              </a>

              <div style="font-family: 'Courier New', Courier, monospace">
                {{ item.ipAddress }} | PIN: {{ item.powerPin | default('not defined') }} |
                Min rate: {{ item.minRate | default('not defined') }} | FAN: {{ item.fansSpeed }}%
              </div>

              <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; margin: 5px 0 5px 0">

                {% for gpu in item.gpu %}

                  <strong>
                    {{ gpu.name }}:
                  </strong>

                  {{ gpu.speed }} Mh/s,

                  fan: {{ gpu.fanSpeed }}%,

                  <i class="fa fa-thermometer-half" aria-hidden="true"></i> {{ gpu.temperature }}

                  <br>

                {% endfor %}

              </div>

              <div>
                {% if item.status === 'running' %}
                  <a class="btn btn-sm btn-warning" href="{{ rebootActionUrl }}">Reboot</a>
                  <a class="btn btn-sm btn-danger" href="{{ shutdownActionUrl }}">Shutdown</a>
                {% elseif item.status === 'stopped' %}
                  <a class="btn btn-sm btn-info" href="{{ startActionUrl }}">Start</a>
                {% endif %}
              </div>

            </div>

          </div>
        {% endfor %}

      </div>

      <div class="list-group-footer">
        <div class="pull-right">
          {{ pagination_rows() }}
        </div>
        <div class="pull-left">
          {{ pagination_pages() }}
        </div>
      </div>

    </div>
  </div>

{% endblock %}
