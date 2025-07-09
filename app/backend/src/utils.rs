use regex::Regex;

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

pub fn seconds_to_time_string(seconds: f64) -> String {
    let hours = (seconds / 3600.0) as u32;
    let minutes = ((seconds % 3600.0) / 60.0) as u32;
    let secs = (seconds % 60.0) as u32;
    
    format!("{:02}:{:02}:{:02}", hours, minutes, secs)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_time_to_seconds() {
        assert_eq!(parse_time_to_seconds("00:01:30").unwrap(), 90.0);
        assert_eq!(parse_time_to_seconds("01:00:00").unwrap(), 3600.0);
        assert_eq!(parse_time_to_seconds("00:00:45").unwrap(), 45.0);
    }

    #[test]
    fn test_seconds_to_time_string() {
        assert_eq!(seconds_to_time_string(90.0), "00:01:30");
        assert_eq!(seconds_to_time_string(3600.0), "01:00:00");
        assert_eq!(seconds_to_time_string(45.0), "00:00:45");
    }
}