use regex::Regex;

pub fn get_all_artists<'a>(artist: &'a str, title: &'a str) -> anyhow::Result<Vec<String>> {
    let re = Regex::new(r#"[(\[](?:(f|F)eat\.|ft\.|with|w/|&|and|,)\s(?P<names>.+)[)\]]"#)?;
    let names = re
			.captures(title)
			.and_then(|captures| captures.name("names"))
			.map(|names| names.as_str())
			.unwrap_or("");

    let mut names = Regex::new(r#",|&"#)?
			.split(names)
			.map(str::trim)
			.map(str::to_string)
			.filter(|s| !s.is_empty())
			.collect::<Vec<_>>();

    names.insert(0, artist.to_string());
    Ok(names)
}