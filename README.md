# Mining controller

![Mining controller on NodeJS](https://raw.githubusercontent.com/bushev/mining-controller/master/screen-1.png)

## Extra info

- gpio-admin uses PINS numbers match exactly
- Mapping for NPM module: https://github.com/rakeshpai/pi-gpio#about-the-pin-configuration

Example (using gpio-admin):
```
gpio-admin export 18
echo out > /sys/class/gpio/gpio18/direction
echo 1 > /sys/class/gpio/gpio18/value
echo 0 > /sys/class/gpio/gpio18/value
```

## How to run in production

`pm2 start ecosystem.config.js --env production`
`pm2 startup`
`...`
`pm2 save`