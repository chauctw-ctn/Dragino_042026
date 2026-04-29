{
  "devices": [
    {
      "id": "dev_1",
      "name": "Flow Meter 1",
      "enabled": true,

      "connection": {
        "host": "192.168.1.100",
        "port": 502,
        "unitId": 1
      },

      "protocol": {
        "byteOrder": "BIG_ENDIAN",
        "wordOrder": "BIG_ENDIAN"
      },

      "polling": {
        "interval": 60000
      },

      "tags": [
        {
          "id": "tag_1",
          "name": "flow",
          "functionCode": 3,
          "address": 0,
          "length": 2,
          "type": "float32",
          "scale": 1,
          "offset": 0,
          "unit": "m3/h"
        },
        {
          "id": "tag_2",
          "name": "level",
          "functionCode": 3,
          "address": 2,
          "length": 1,
          "type": "uint16",
          "scale": 0.1,
          "unit": "m"
        }
      ]
    }
  ]
}



const ENUMS = {
  functionCode: [
    { label: "Coil (01)", value: 1 },
    { label: "Discrete Input (02)", value: 2 },
    { label: "Holding Register (03)", value: 3 },
    { label: "Input Register (04)", value: 4 }
  ],

  dataType: [
    "bool",
    "int16",
    "uint16",
    "int32",
    "uint32",
    "float32",
    "float64"
  ],

  byteOrder: [
    "BIG_ENDIAN",
    "LITTLE_ENDIAN"
  ],

  wordOrder: [
    "BIG_ENDIAN",
    "LITTLE_ENDIAN"
  ]
};


