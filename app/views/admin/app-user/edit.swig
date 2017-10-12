{% extends 'app/views/admin/layout.swig' %}

{% block title %}Edit user {{ item.id }}{% endblock %}

{% block pageheader %}
  {{ pageheader({title: 'Users management - edit user', showSaveButton: true, showCloseButton: true}) }}
{% endblock %}

{% block pagecontent %}
  {% include "_form.swig" %}
{% endblock %}