{% extends 'layout.swig' %}

{% block pagecontent %}

  <link href="http://vjs.zencdn.net/5.17.0/video-js.css" rel="stylesheet">

  <div class="row row-stat">
    <div class="col-md-4">
      <div class="panel panel-dark noborder">
        <div class="panel-heading noborder">
          <div class="panel-icon"><i class="fa fa-thermometer-half"></i></div>
          <div class="media-body">
            <h5 class="md-title nomargin">Текущая температура</h5>
            <h1 class="mt5">{{ temperature }} °C</h1>
          </div>
          <hr>
          <div class="clearfix mt20">
            <div class="pull-left">
              <h5 class="md-title nomargin">Влажность</h5>
              <h4 class="nomargin">{{ humidity }} %</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-8">
      <canvas id="dht-22-data-chart" width="100%"></canvas>
    </div>
  </div>

  <hr>

  <div class="row">
    <div class="col-md-12">
      {% if isStreaming %}

        <video id="example_video_1" class="video-js vjs-default-skin"
               controls preload="auto" autoplay width="640" height="480"
               poster="http://video-js.zencoder.com/oceans-clip.png"
               data-setup='{"example_option":true}'>
          <source src="{{ streamUrl }}" type="video/flv">
        </video>

        <a class="btn btn-sm btn-default" href="/admin/stream/stop-stream">Stop stream</a>
      {% else %}
        <a class="btn btn-sm btn-default" href="/admin/stream/start-stream">Start stream</a>
      {% endif %}
    </div>
  </div>

  <script src="http://vjs.zencdn.net/5.17.0/video.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.bundle.min.js"></script>

{% endblock %}

{% block extra_scripts %}
  <script>
    new Chart(document.getElementById('dht-22-data-chart'), {
      type: 'line',
      data: {
        labels: {{ JSON.stringify(dht22Data.labels) }},
        datasets: [{
          label: 'Temperature',
          data: {{ JSON.stringify(dht22Data.temperature) }},
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 1,
          pointHitRadius: 5
        }, {
          label: 'Humidity',
          data: {{ JSON.stringify(dht22Data.humidity) }},
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 1,
          pointHitRadius: 5
        }]
      },
      options: {
        tooltips: {
          mode: 'label'
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  </script>
{% endblock %}