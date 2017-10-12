{% macro searchByUserStatus() %}

  {% set filterName = 'inFieldStatus' %}

  <div class="form-group">

    <select class="form-control select2" data-filter="{{ filterName }}" multiple style="width:100%"
            data-placeholder="Filter by status">

      {% set statuses = [{value: 'active', name: 'Active'}, {value: 'suspended', name: 'Suspended'}] %}

      {% set filterData = filters.inField | find({filterName: filterName}) %}

      {% for status in statuses %}
        <option value="{{ status.value }}"
                {% if filterData and filterData.fieldValue.indexOf(status.value) > -1 %}selected{% endif %}>
          {{ status.name }}
        </option>
      {% endfor %}
    </select>
  </div>
{% endmacro %}