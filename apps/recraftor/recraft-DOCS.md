**  
Usage**

Dig into the details of using the Recraft API.

**Generate Image**

Creates an image given a prompt.

POST https://external.api.recraft.ai/v1/images/generations

**Example**

response = client.images.generate(

prompt='race car on a track',

style='digital_illustration',

)

print(response.data[0].url)

**Output**

URL: https://img.recraft.ai/TH4CG_8z2Ql8G1B_mx9tkVQk67i6TmdM9Av13L2-ERE

/rs:fit:1024:1024:0/raw:1/plain/abs:/

/prod/images/a9f881cb-7638-4fa8-88d2-cc65dbfd0375

**Parameters**

| **Parameter**     | **Type**                                   | **Description**                                                                       |
|-------------------|--------------------------------------------|---------------------------------------------------------------------------------------|
| prompt (required) | string                                     | A text description of the desired image(s). The maximum length is 1000 characters     |
| n                 | integer or null, default is 1              | Currently, only n=1 and n=2 are supported at the momen                                |
| style_id          | UUID or null                               | Use a previously uploaded style as a reference, this topic is covered above and below |
| style             | string or null, default is realistic_image | The style of the generated images, this topic is covered above                        |
| substyle          | string or null                             | This topic is covered above                                                           |
| model             | string or null, default is recraftv3       | The model to use for image generation. Must be one of recraftv3 or recraft20b         |
| response_format   | string or null, default is url             | The format in which the generated images are returned. Must be one of url or b64_json |
| size              | string or null, default is 1024x1024       | The size of the generated images in WxH format, supported values are published below  |
| controls          | object or null                             | A set of custom parameters to tweak generation process, this topic is covered below   |

**  
Note**: style_id and style parameters are mutually exclusive. If neither of the two parameters is specified, the default style of realistic_image will be used  
  
‍**Hint:** if OpenAI Python Library is used, non-standard parameters can be passed using the extra_body argument. For example:

response = client.images.generate(

prompt='race car on a track',

extra_body={

'style_id': style_id,

'controls': {

...

}

}

)

print(response.data[0].url)

**Vectorize Image**

Converts a given raster image to SVG format.

POST https://external.api.recraft.ai/v1/images/vectorize

**Example**

response = client.post(

path='/images/vectorize',

cast_to=object,

options={'headers': {'Content-Type': 'multipart/form-data'}},

files={'file': open('image.png', 'rb')},

)

print(response['image']['url'])

**Output**

https://img.recraft.ai/fZm6nwEjI9Qy94LukIKbxRm4w2i5crwqu459qKg7ZWY

/rs:fit:1341:1341:0/raw:1/plain/abs://external/images/2835e19f-282b-419b-b80c-9231a3d51517

**Parameters**

Body of a request should be a file in PNG format and parameters passed as content type 'multipart/form-data'.

| **Parameter**   | **Type**                       | **Description**                                                                            |
|-----------------|--------------------------------|--------------------------------------------------------------------------------------------|
| response_format | string or null, default is url | The format in which the generated images are returned. Must be one of 'url' or 'b64_json'. |

**Remove Background**

Removes background of a given raster image.

POST https://external.api.recraft.ai/v1/images/removeBackground

**Example**

response = client.post(

path='/images/removeBackground',

cast_to=object,

options={'headers': {'Content-Type': 'multipart/form-data'}},

files={'file': open('image.png', 'rb')},

)

print(response['image']['url'])

**Output**

https://img.recraft.ai/EYOLjpky-2-uClelfP61kzK-SEpIhKgLfjLFFGxmM_U

/rs:fit:0:0:0/raw:1/plain/abs://external/images/e2d0cba6-12df-4141-aa21-43bfd5889990

**Parameters**

Body of a request should be a file in PNG format and parameters passed as content type 'multipart/form-data'.

| **Parameter**   | **Type**                       | **Description**                                                                            |
|-----------------|--------------------------------|--------------------------------------------------------------------------------------------|
| response_format | string or null, default is url | The format in which the generated images are returned. Must be one of 'url' or 'b64_json'. |

**Clarity Upscale**

Enhances a given raster image using ‘clarity upscale’ tool, increasing image resolution, making the image sharper and cleaner.

POST https://external.api.recraft.ai/v1/images/clarityUpscale

**Example**

response = client.post(

path='/images/clarityUpscale',

cast_to=object,

options={'headers': {'Content-Type': 'multipart/form-data'}},

files={'file': open('image.png', 'rb')},

)

print(response['image']['url'])

**Output**

https://img.recraft.ai/LtCo_bs3chC8zhrku0CWLpCBKv4iOODprEdeD_MY1dw

/rs:fit:1760:2348:0/raw:1/plain/abs://external/images/f7d01b15-0eba-4439-a5fb-38af38fb524e

**Request Body**

Body of a request should be a file in PNG format and parameters passed as content type multipart/form-data.

| **Parameter**   | **Type**                       | **Description**                                                                                |
|-----------------|--------------------------------|------------------------------------------------------------------------------------------------|
| response_format | string or null, default is url | The format in which the generated images are returned. Must be one of \`url\` or \`b64_json\`. |

**Generative Upscale**

Enhances a given raster image using ‘generative upscale’ tool, boosting resolution with a focus on refining small details and faces.

POST https://external.api.recraft.ai/v1/images/generativeUpscale

**Example**

response = client.post(

path='/images/generativeUpscale',

cast_to=object,

options={'headers': {'Content-Type': 'multipart/form-data'}},

files={'file': open('image.png', 'rb')},

)

print(response['image']['url'])

**Output**

https://img.recraft.ai/DV4d9pMeq5lIluqS7m8qHyg-mb6hf5uCqEPPC8t8wy4

/rs:fit:4740:3536:0/raw:1/plain/abs://external/images/fb576169-8a66-4270-a566-35713ad72020

**Request Body**

Body of a request should be a file in PNG format and parameters passed as content type multipart/form-data.

| **Parameter**   | **Type**                       | **Description**                                                                                |
|-----------------|--------------------------------|------------------------------------------------------------------------------------------------|
| response_format | string or null, default is url | The format in which the generated images are returned. Must be one of \`url\` or \`b64_json\`. |

**Create style**

Upload a set of images to create a style reference.

POST https://external.api.recraft.ai/v1/styles

**Example**

response = client.post(

path='/styles',

cast_to=object,

options={'headers': {'Content-Type': 'multipart/form-data'}},

body={'style': 'digital_illustration'},

files={'file1': open('image.png', 'rb')},

)

print(response['id'])

**Output**

{"id": "229b2a75-05e4-4580-85f9-b47ee521a00d"}

**Request Body**

Upload a set of images to create a style reference.

| **Parameter**    | **Type** | **Description**                                                                        |
|------------------|----------|----------------------------------------------------------------------------------------|
| style (required) | string   | The base style of the generated images, this topic is covered above.                   |
| files (required) | files    | Images in PNG format for using as style references. The max number of the images is 5. |

**Auxiliary**

**Controls**

The generation process can be adjusted with a number of tweaks.

| colors (required) | An array of preferable colors                 |
|-------------------|-----------------------------------------------|
| background_color  | Use given color as a desired background color |

**Colors**

Color type is defined as an object with the following fields

| rgb (required) | An array of 3 integer values in range of 0...255 defining RGB Color Model |
|----------------|---------------------------------------------------------------------------|

**Example**

response = client.images.generate(

prompt='race car on a track',

style='realistic_image',

extra_body={

'controls': {

'image_type': 'realistic_image',

'colors': [

{'rgb': [0, 255, 0]}

]

}

}

)

print(response.data[0].url)

**Guides**

Generate AI images using cURL or Python and create your own styles programmatically.

**Generate a Digital Illustration Using RecraftV3 Model**

Curl

Python

from openai import OpenAI

client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

response = client.images.generate(

prompt='two race cars on a track',

style='digital_illustration',

model='recraftv3',

)

print(response.data[0].url)

**Generate a Realistic Image with Specific Size**

Curl

Python

curl https://external.api.recraft.ai/v1/images/generations \\

\-H "Content-Type: application/json" \\

\-H "Authorization: Bearer \$RECRAFT_API_TOKEN" \\

\-d '{

"prompt": "red point siamese cat",

"style": "realistic_image",

"size": "1280x1024"

}'

**Generate a Digital Illustration with Specific Substyle**

Curl

Python

curl https://external.api.recraft.ai/v1/images/generations \\

\-H "Content-Type: application/json" \\

\-H "Authorization: Bearer \$RECRAFT_API_TOKEN" \\

\-d '{

"prompt": "a monster with lots of hands",

"style": "digital_illustration",

"substyle": "hand_drawn"

}'

**Create Own Style by Uploading Reference Images and Use Them for Generation**

Curl

Python

curl -X POST https://external.api.recraft.ai/v1/styles \\

\-H "Content-Type: multipart/form-data" \\

\-H "Authorization: Bearer \$RECRAFT_API_TOKEN" \\

\-F "style=digital_illustration" \\

\-F "file=@image.png"

\# response: {"id":"095b9f9d-f06f-4b4e-9bb2-d4f823203427"}

curl https://external.api.recraft.ai/v1/images/generations \\

\-H "Content-Type: application/json" \\

\-H "Authorization: Bearer \$RECRAFT_API_TOKEN" \\

\-d '{

"prompt": "wood potato masher",

"style_id": "095b9f9d-f06f-4b4e-9bb2-d4f823203427"

}'

**Vectorize an Image in PNG format**

Curl

Python

curl -X POST https://external.api.recraft.ai/v1/images/vectorize \\

\-H "Content-Type: multipart/form-data" \\

\-H "Authorization: Bearer \$RECRAFT_API_TOKEN" \\

\-F "file=@image.png"

**Remove Background From a PNG Image, Get the Result in B64 JSON**

Curl

Python

curl -X POST https://external.api.recraft.ai/v1/images/removeBackground \\

\-H "Content-Type: multipart/form-data" \\

\-H "Authorization: Bearer \$RECRAFT_API_TOKEN" \\

\-F "response_format=b64_json" \\

\-F "file=@image.png"

**Run Clarity Upscale Tool for a PNG Image, Get the Result in B64 JSON**

Curl

Python

curl -X POST https://external.api.recraft.ai/v1/images/clarityUpscale \\

\-H "Content-Type: multipart/form-data" \\

\-H "Authorization: Bearer \$RECRAFT_API_TOKEN" \\

\-F "response_format=b64_json" \\

\-F "file=@image.png"

**Run Generative Upscale Tool for a PNG Image**

Curl

Python

curl -X POST https://external.api.recraft.ai/v1/images/generativeUpscale \\

\-H "Content-Type: multipart/form-data" \\

\-H "Authorization: Bearer \$RECRAFT_API_TOKEN" \\

\-F "file=@image.png"

**Appendix**

**List of styles**

| **Style**            | **RecraftV3 Substyles (NEW MODEL)**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | **Recraft20B Substyles**                                                                                                                                                                                            |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| any                  | (not applicable)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | (not available)                                                                                                                                                                                                     |
| realistic_image      | - b_and_w - enterprise - evening_light - faded_nostalgia - forest_life - hard_flash - hdr - motion_blur - mystic_naturalism - natural_light - natural_tones - organic_calm - real_life_glow - retro_realism - retro_snapshot - studio_portrait - urban_drama - village_realism - warm_folk                                                                                                                                                                                                                                                                                                                      | - b_and_w - enterprise - hard_flash - hdr - motion_blur - natural_light - studio_portrait                                                                                                                           |
| digital_illustration | - 2d_art_poster - 2d_art_poster_2 - engraving_color - grain - hand_drawn - hand_drawn_outline - handmade_3d - infantile_sketch - pixel_art - antiquarian - bold_fantasy - child_book - child_books - cover - crosshatch - digital_engraving - expressionism - freehand_details - grain_20 - graphic_intensity - hard_comics - long_shadow - modern_folk - multicolor - neon_calm - noir - nostalgic_pastel - outline_details - pastel_gradient - pastel_sketch - pop_art - pop_renaissance - street_art - tablet_sketch - urban_glow - urban_sketching - vanilla_dreams - young_adult_book - young_adult_book_2 | - 2d_art_poster - 2d_art_poster_2 - 3d - 80s - engraving_color - glow - grain - hand_drawn - hand_drawn_outline - handmade_3d - infantile_sketch - kawaii - pixel_art - psychedelic - seamless - voxel - watercolor |
| vector_illustration  | - bold_stroke - chemistry - colored_stencil - contour_pop_art - cosmics - cutout - depressive - editorial - emotional_flat - engraving - infographical - line_art - line_circuit - linocut - marker_outline - mosaic - naivector - roundish_flat - segmented_colors - sharp_contrast - thin - vector_photo - vivid_shapes                                                                                                                                                                                                                                                                                       | - cartoon - doodle_line_art - engraving - flat_2 - kawaii - line_art - line_circuit - linocut - seamless                                                                                                            |
| icon                 | (not available)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | - broken_line - colored_outline - colored_shapes - colored_shapes_gradient - doodle_fill - doodle_offset_fill - offset_fill - outline - outline_gradient - uneven_fill                                              |

**List of image sizes**

\- 1024x1024  
\- 1365x1024  
\- 1024x1365  
\- 1536x1024  
\- 1024x1536  
\- 1820x1024  
\- 1024x1820  
\- 1024x2048  
\- 2048x1024  
\- 1434x1024  
\- 1024x1434  
\- 1024x1280  
\- 1280x1024  
\- 1024x1707  
\- 1707x1024

**Policies**

1.  All generated images are currently stored indefinitely. However, this policy may change in the future, and you should not rely on it remaining constant.

2.  Images are publicly accessible via direct links without authentication. However, since the URLs include unique image identifiers and are cryptographically signed, restoring lost links is nearly impossible.

3.  Currently, image generation rates are defined on a per-user basis and set at **100 images per minute**. These rates may be adjusted in the future.
