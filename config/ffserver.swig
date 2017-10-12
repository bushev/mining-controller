HTTPPort {{ ffserver.httpPort }}
HTTPBindAddress {{ ffserver.httpBindAddress }}
{#MaxHTTPConnections {{ ffserver.maxHttpConnections }}#}
MaxClients {{ ffserver.maxClients }}
MaxBandwidth {{ ffserver.maxBandwidth }}
{#CustomLog -#}

<Feed {{ cameraName }}-feed.ffm>
  File /tmp/{{ cameraName }}-feed.ffm
  FileMaxSize {{ ffserver.fileMaxSize }}
  {#ACL allow 127.0.0.1#}
</Feed>

<Stream {{ streamName }}>
  Feed {{ cameraName }}-feed.ffm
  Format flv

  VideoSize {{ ffserver.videoSize }}
  VideoFrameRate {{ ffserver.videoFrameRate }}

  VideoBufferSize 4096
  VideoBitRate {{ ffserver.videoBitRate }}

  AudioBitRate {{ ffserver.audioBitRate }}
  AudioChannels 1
  AudioSampleRate 11025
  VideoQMin 3
  VideoQMax 31

  {#NoAudio#}

  {##VideoQMin 3#}
  {##VideoQMax 31#}
  {#NoAudio#}
  {#Strict -1#}
</Stream>

<Stream stat.html>
  Format status
</Stream>

{#<Stream live-stream-{{ streamingToken }}.flv>#}
  {#Format flv#}
  {#Feed {{ cameraName }}-feed.ffm#}

  {##VideoCodec libx264#}
  {#VideoFrameRate {{ ffserver.videoFrameRate }}#}
  {#VideoBitRate {{ ffserver.videoBitRate }}#}
  {#VideoSize {{ ffserver.videoSize }}#}
  {##AVOptionVideo crf 23#}
  {##AVOptionVideo preset medium#}
  {## for more info on crf/preset options, type: x264 --help#}
  {##AVOptionVideo flags +global_header#}

  {#{% if ffserver.audioInput %}#}
    {#AudioCodec aac#}
    {#Strict -2#}
    {#AudioBitRate {{ ffserver.audioBitRate }}#}
    {#AudioChannels 2#}
    {#AudioSampleRate 44100#}
    {#AVOptionAudio flags +global_header#}
  {#{% else %}#}
    {#NoAudio#}
  {#{% endif %}#}
{#</Stream>#}