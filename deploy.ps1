Write-Output 'reading env'

if (!$(Test-Path -Path .\.env)){
	Write-Error '.env file not found'

	break
}

Get-Content .env | ForEach-Object {
	$line = $_.trim()

	if ($line -match '^\s*#' -or $line -match '^\s*$') {
		return
	}

	$key, $value = $line.split('=')
	$key = $key.Trim()
	$value = $value.Trim()

	Write-Output "$key=$value"

	Set-Content env:\$key $value
}
