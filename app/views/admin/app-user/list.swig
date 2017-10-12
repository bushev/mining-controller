{% extends 'app/views/admin/layout.swig' %}

{% block title %}Users{% endblock %}

{% block pageheader %}
  {{ pageheader({title: 'Users'}) }}
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
        {{ searchByUserStatus() }}

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
            {{ sorting_column({title: 'E-mail', field: 'email'}) }}
            {{ sorting_column({title: 'Phone', field: 'phone'}) }}
          </div>
        </div>

        {% for item in items %}
          {% set editActionUrl = baseUrl + '/' + item.id + '/edit' %}
          {% set viewActionUrl = baseUrl + '/' + item.id %}
          {% set deleteActionUrl = baseUrl + '/' + item.id + '/delete' %}

          <div class="list-group-item">

            {{ item_select_checkbox() }}

            <div class="list-group-item-body">
              <div class="pull-right media-option clearfix">

                <div class="text-right">

                  {% if item.status === 'active' %}
                    <div class="label label-success">Active</div>
                  {% elseif item.status === 'suspended' %}
                    <div class="label label-default">Suspended</div>
                  {% endif %}

                  {{ resource_action_buttons({
                    viewActionUrl: viewActionUrl,
                    editActionUrl: editActionUrl,
                    deleteActionUrl: deleteActionUrl}) }}

                  <p class="help-block">
                    <small>{{ moment(item.createdAt).calendar() }}</small>
                  </p>
                </div>

              </div>

              <a href="{{ viewActionUrl }}">
                <h4 class="sender">
                  {{ item.email }}
                </h4>
              </a>

              <div>
                Phone: {{ item.phone | default('unknown') }}
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
