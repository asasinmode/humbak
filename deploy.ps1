function Write-Colored-Output {
	param(
		[parameter(Mandatory = $true)][string]$text,
		[parameter(Mandatory = $true)][string]$color
	)

	$tempColor = [System.Console]::ForegroundColor
	[System.Console]::ForegroundColor = $color
	[System.Console]::Write($text)
	[System.Console]::ForegroundColor = $tempColor
}

function New-Menu {
	param(
		[parameter(Mandatory = $true)][System.Collections.Generic.List[string]]$menuItems,
		[string]$title = 'menu title',
		[switch]${No-Clear}
	)
	[System.Console]::CursorVisible = $false

	Write-Colored-Output "`n$title`n`n" 'green'

	$selectIndex = 0
	$outChar = 'a'
	$shouldAdjustCursor = $false
	$initialCursorPosition = [System.Console]::CursorTop
	$targetCursorPosition = [System.Console]::CursorTop

	if ($targetCursorPosition -eq $Host.UI.RawUI.WindowSize.Height - 1) {
		$targetCursorPosition += 1
	}

	if (!($targetCursorPosition + $menuItems.Count -lt $Host.UI.RawUI.WindowSize.Height - 1)) {
		$shouldAdjustCursor = $true
	}
	
	while (([System.Int16]$inputChar.Key -ne [System.ConsoleKey]::Enter) -and ([System.Int16]$inputChar.Key -ne [System.ConsoleKey]::Escape)) {
		if ($targetCursorPosition -ne $Host.UI.RawUI.WindowSize.Height) {
			[System.Console]::CursorTop = $targetCursorPosition
		}
		else {
			$targetCursorPosition -= $menuItems.Count + 1
			$shouldAdjustCursor = $false
		}

		for ($i = 0; $i -lt $menuItems.Count; $i++) {
			[System.Console]::Write('[')

			if ($selectIndex -eq $i) {
				Write-Colored-Output 'X' 'cyan'
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

		if ($shouldAdjustCursor) {
			$targetCursorPosition += $initialCursorPosition + $menuItems.Count - $Host.UI.RawUI.WindowSize.Height - 1
			$shouldAdjustCursor = $false
		}

		$outChar = $inputChar
	}

	if ($outChar.Key -eq [System.ConsoleKey]::Escape) {
		break
	}

	[System.Console]::CursorVisible = $true
	return $menuItems[$selectIndex]
}

function Invoke-Build {
	pnpm run build
}

function Publish-Project {
	Write-Output 'deploying'
}

if (!(Test-Path -Path .\.env)) {
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
	Write-Colored-Output 'option currently not supported' 'red'

	break
}

$action = New-Menu @('build', 'deploy', 'build and deploy') 'choose action' -No-Clear

Push-Location $project

if ($action -eq 'build') {
	Invoke-Build
}
elseif ($action -eq 'deploy') {
	Publish-Project
}
else {
	Invoke-Build
	Publish-Project
}

Pop-Location
