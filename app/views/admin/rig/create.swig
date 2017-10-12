{% extends 'app/views/admin/layout.swig' %}

{% block title %}Rigs{% endblock %}

{% block pageheader %}
  {{ pageheader({title: 'Rigs management - create new rig', showSaveButton: true, showCloseButton: true}) }}
{% endblock %}

{% block pagecontent %}
  {% include "_form.swig" %}
{% endblock %}

{% block page_js %}

{% endblock %}
