<div class="tab-pane active" id="tab-basic">

  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title">Basic info</h3>
    </div>
    <div class="panel-body">

      <div class="row">
        <div class="col-sm-3">
          <div class="form-group">
            <label class="control-label" for="name">Name</label>
            <input type="text" id="name" name="name" class="form-control" value="{{ item.name }}" required>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="form-group">
            <label class="control-label" for="ipAddress">IP Address</label>
            <input type="text" id="ipAddress" name="ipAddress" class="form-control" value="{{ item.ipAddress }}">
          </div>
        </div>
        <div class="col-sm-2">
          <div class="form-group">
            <label class="control-label" for="powerPin">Power PIN</label>
            <input type="number" id="powerPin" name="powerPin" class="form-control" value="{{ item.powerPin }}">
          </div>
        </div>
        <div class="col-sm-4">
          <div class="form-group">
            <label class="control-label" for="status">Status</label>
            <select id="status" name="status" class="form-control" required>
              <option value="stopped" {% if item.status === 'stopped' %}selected{% endif %}>Stopped</option>
              <option value="running" {% if item.status === 'running' %}selected{% endif %}>Running</option>
            </select>
          </div>
        </div>
      </div>

      <div class="row">

        <div class="col-sm-6">
          <div class="form-group">
            <label class="control-label" for="name">ETH Address</label>
            <input type="text" id="ethAddress" name="ethAddress" class="form-control" value="{{ item.ethAddress }}"
                   required>
          </div>
        </div>

        <div class="col-sm-2">
          <div class="form-group">
            <label class="control-label" for="minRate">Min rate</label>
            <input type="number" id="minRate" name="minRate" class="form-control" value="{{ item.minRate }}">
          </div>
        </div>

        <div class="col-sm-2">
          <div class="form-group">
            <label class="control-label" for="fansSpeed">Fans speed (%)</label>
            <input type="number" id="fansSpeed" name="fansSpeed" class="form-control" value="{{ item.fansSpeed }}">
          </div>
        </div>

      </div>

    </div>
  </div>

</div>
