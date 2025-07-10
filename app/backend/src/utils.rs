use regex::Regex;
#[allow(dead_code)]
pub fn parse_time_to_seconds(time_str: &str) -> Result<f64, Box<dyn std::error::Error>> {
    let re = Regex::new(r"^(\d{2}):(\d{2}):(\d{2})$")?;
    
    if let Some(captures) = re.captures(time_str) {
        let hours: f64 = captures[1].parse()?;
        let minutes: f64 = captures[2].parse()?;
        let seconds: f64 = captures[3].parse()?;
        
        Ok(hours * 3600.0 + minutes * 60.0 + seconds)
    } else {
        Err("Invalid time format. Expected HH:MM:SS".into())
    }
}
#[allow(dead_code)]
pub fn seconds_to_time_string(seconds: f64) -> String {
    let hours = (seconds / 3600.0) as u32;
    let minutes = ((seconds % 3600.0) / 60.0) as u32;
    let secs = (seconds % 60.0) as u32;
    
    format!("{:02}:{:02}:{:02}", hours, minutes, secs)
}

