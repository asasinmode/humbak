function New-Menu {
	param(
		[parameter(Mandatory = $true)][System.Collections.Generic.List[string]]$menuItems,
		[string]$title = 'menu title'
	)

	$selectIndex = 0
	$outChar = 'a'

	[System.Console]::CursorVisible = $false
	[Console]::Clear()

	while (([System.Int16]$inputChar.Key -ne [System.ConsoleKey]::Enter) -and ([System.Int16]$inputChar.Key -ne [System.ConsoleKey]::Escape)) {

		[System.Console]::CursorTop = 0
		$tempColor = [System.Console]::ForegroundColor
		[System.Console]::ForegroundColor = 'green'
		[System.Console]::WriteLine("$title`n")
		[System.Console]::ForegroundColor = $tempColor

		for ($i = 0; $i -lt $menuItems.Count; $i++) {
			[System.Console]::Write('[')

			if ($selectIndex -eq $i) {
				[System.Console]::ForegroundColor = 'cyan'
				[System.Console]::Write('X')
				[System.Console]::ForegroundColor = $tempColor
			}
			else {
				[System.Console]::Write(' ')
			}

			[System.Console]::Write('] ')
			[System.Console]::WriteLine($menuItems[$i])
		}

		$inputChar = [System.Console]::ReadKey($true)

		if ([System.Int16]$inputChar.Key -eq [System.ConsoleKey]::DownArrow) {
			if ($selectIndex -lt $menuItems.Count - 1) {
				$selectIndex++
			}
			else {
				$selectIndex = 0
			}
		}
		elseif ([System.Int16]$inputChar.Key -eq [System.ConsoleKey]::UpArrow) {
			if ($selectIndex -gt 0) {
				$selectIndex--
			}
			else {
				$selectIndex = $menuItems.Count - 1
			}
		}

		$outChar = $inputChar
	}

	if ($outChar.Key -eq [System.ConsoleKey]::Escape) {
		break
	}

	return $menuItems[$selectIndex]
}

if (!$(Test-Path -Path .\.env)) {
	Write-Error '.env file not found'

	break
}

Get-Content .\.env | ForEach-Object {
	$line = $_.trim()

	if ($line -match '^\s*#' -or $line -match '^\s*$') {
		return
	}

	$key, $value = $line.split('=')
	$key = $key.Trim()
	$value = $value.Trim()

	Set-Content env:\$key $value
}

$project = New-Menu @('api', 'admin', 'webpage') 'choose project'

if ($project -ne 'api') {
	$tempColor = [System.Console]::ForegroundColor
	[System.Console]::ForegroundColor = 'red'
	[System.Console]::WriteLine('option currently not supported')
	[System.Console]::ForegroundColor = $tempColor

	break
}

$action = New-Menu @('build', 'deploy', 'build and deploy') $project

Write-Output "doing action $action"
