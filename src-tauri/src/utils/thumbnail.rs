use std::io::Cursor;

use image::{load_from_memory, EncodableLayout, ImageOutputFormat};
use prominence::Palette;
use windows::core::{Error as WindowsError, HRESULT};
use windows::Security::Cryptography::CryptographicBuffer;
use windows::Storage::Streams::{Buffer, IRandomAccessStreamReference, InputStreamOptions};

use crate::utils::color::get_color_palette;

pub async fn get_thumbnail_data(
  stream_reference: Result<IRandomAccessStreamReference, WindowsError>,
) -> windows::core::Result<(Option<Palette>, String)> {
  println!("get_thumbnail_base64");

  let stream = stream_reference?.OpenReadAsync()?.await?;

  let stream_size: u32 = stream.Size()? as u32;
  let buffer = stream
    .ReadAsync(
      &Buffer::Create(stream_size)?,
      stream_size,
      InputStreamOptions::ReadAhead,
    )?
    .await?;

  let bytes = &mut windows::core::Array::<u8>::new();
  CryptographicBuffer::CopyToByteArray(&buffer, bytes).unwrap();

  match load_from_memory(bytes.as_bytes()) {
    Ok(mut image) => {
      /* Crop the Spotify watermark out of the image */
      let image = image.crop(34, 1, 233, 233);

      /* Write the image to a buffer, which is then encoded into a base64 string */
      let mut buf = vec![];
      image
        .write_to(&mut Cursor::new(&mut buf), ImageOutputFormat::Png)
        .unwrap();

      Ok((Some(get_color_palette(&image)), base64::encode(&buf)))
    },
    Err(_) => Err(WindowsError::new(
      HRESULT(1),
      "Error encoding image to base64".into(),
    )),
  }
}
