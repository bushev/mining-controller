<div class="tab-pane active" id="tab-basic">

  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title">Basic info</h3>
    </div>
    <div class="panel-body">

      <div class="row">
        <div class="col-sm-3">
          <div class="form-group">
            <label class="control-label" for="email">E-mail</label>
            <input type="email" id="email" name="email" class="form-control" value="{{ item.email }}" required>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="form-group">
            <label class="control-label" for="phone">Phone</label>
            <input type="text" id="phone" name="phone" class="form-control" value="{{ item.phone }}" required>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="form-group">
            <label class="control-label" for="status">Status</label>
            <select id="status" name="status" class="form-control" required>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  </div>

</div>
