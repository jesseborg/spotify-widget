// Source: https://github.com/Spanfile/Prominence/blob/master/examples/filter.rs

use image::DynamicImage;
use prominence::{Filter, Palette};

const BLACK_MAX_LIGHTNESS: f32 = 0.02; // 0.02
const WHITE_MIN_LIGHTNESS: f32 = 0.90; // 0.90

// this filter uses the same approach as the default filter in prominence,
// except it allows more darker colors and blocks more lighter colors
struct CustomFilter;
impl Filter for CustomFilter {
  fn is_allowed(&self, _: (u8, u8, u8), (_, _, l): (f32, f32, f32)) -> bool {
    !is_black(l) && !is_white(l)
  }
}

fn is_black(l: f32) -> bool { l <= BLACK_MAX_LIGHTNESS }
fn is_white(l: f32) -> bool { l >= WHITE_MIN_LIGHTNESS }

pub(crate) fn get_color_palette(image: &DynamicImage) -> Palette {
  prominence::PaletteBuilder::from_image(image.to_rgb8())
    .clear_filters() // remove the default filter
    .add_filter(CustomFilter) // add our custom filter
    .generate()
}
