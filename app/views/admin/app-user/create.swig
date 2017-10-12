{% extends 'app/views/admin/layout.swig' %}

{% block title %}Users{% endblock %}

{% block pageheader %}
  {{ pageheader({title: 'Users management - create new user', showSaveButton: true, showCloseButton: true}) }}
{% endblock %}

{% block pagecontent %}
  {% include "_form.swig" %}
{% endblock %}
