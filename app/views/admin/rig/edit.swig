{% extends 'app/views/admin/layout.swig' %}

{% block title %}Edit rig {{ item.id }} {% endblock %}

{% block pageheader %}
  {{ pageheader({title: 'Rigs management - edit rig', showSaveButton: true, showCloseButton: true}) }}
{% endblock %}

{% block pagecontent %}
  {% include "_form.swig" %}
{% endblock %}

{% block page_js %}

{% endblock %}
