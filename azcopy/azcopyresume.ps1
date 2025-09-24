$azcopyPath = "xxxx"
$sourcePath = "xxxx"
$destUrl = "xxxx"
$resumejobid = "xxxx"
$capMbps = 100
$maxRetries = 100
$retryCount = 0
$success = $false
$sleepsecond = 100

$logFile = "azcopy_log_$(Get-Date -Format 'yyyyMMdd').txt"
$logPath = Join-Path -Path $PSScriptRoot -ChildPath $logFile

$smtpServer = "xxxx"
$smtpPort = "xxxx"
$smtpUser = "xxxx"
$smtpPassword = "xxxx"
$from = "xxxx"
$to = "xxxx"
$subjectBase = "AzCopy Resume Notification"

function Write-Log {
    param (
        [string]$Message
    )
    $timestamp = Get-Date -Format "yyyyMMdd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry -ForegroundColor Cyan
    Add-Content -Path $logPath -Value $logEntry
}

function Send-UTF8Mail {
    param (
        [string]$Subject,
        [string]$Body
    )

    $mail = New-Object System.Net.Mail.MailMessage
    $mail.From = $from
    $mail.To.Add($to)
    $mail.Subject = $Subject
    $mail.Body = $Body
    $mail.BodyEncoding = [System.Text.Encoding]::UTF8
    $mail.SubjectEncoding = [System.Text.Encoding]::UTF8
    $mail.IsBodyHtml = $false

    $smtp = New-Object System.Net.Mail.SmtpClient($smtpServer, $smtpPort)
    $smtp.EnableSsl = $true
    $smtp.Credentials = New-Object System.Net.NetworkCredential($smtpUser, $smtpPassword)

    try {
        $smtp.Send($mail)
        Write-Log "Send email: $Subject"
    } catch {
        Write-Log "Failed to send email：$($_.Exception.Message)"
    }
}

while (-not $success -and $retryCount -lt $maxRetries) {
    $retryCount++
    $timestamp = Get-Date -Format "yyyyMMdd HH:mm:ss"
    Write-Log "[Start $retryCount] AzCopy Resuming..."

	try {
	    & "$azcopyPath" jobs resume "$resumejobid" --cap-mbps=$capMbps
	
	    if ($LASTEXITCODE -eq 0) {
	        Write-Log "[Success] AzCopy Resume completed."
	        $mailBody = "Time: $timestamp`n$msg`nSource: $sourcePath`nDesT: $destUrl"
	        Send-UTF8Mail -Subject "$subjectBase - Mission Completed. RetryCount:#$retryCount" -Body $mailBody	        
	        $success = $true
	    } else {
	        $msg = "AzCopy execution failed with exit code: $LASTEXITCODE. Preparing for the $retryCount retry..."
	        Write-Log $msg	
	        $mailBody = "Time: $timestamp`n$msg`nSource: $sourcePath`nDesT: $destUrl"
	        Send-UTF8Mail -Subject "$subjectBase - Failed #$retryCount" -Body $mailBody
	        Start-Sleep -Seconds $sleepsecond
	    }
	} catch {        
	    $msg = "AzCopy Resume Failed：$($_.Exception.Message)"
	    Write-Log $msg	
	    $mailBody = "Time: $timestamp`n$msg`nSource: $sourcePath`nDesT: $destUrl"
	    Send-UTF8Mail -Subject "$subjectBase - Failed #$retryCount" -Body $mailBody
	    Start-Sleep -Seconds $sleepsecond
	}
}

if (-not $success) {
    Write-Log "[Failed] All attempts failed, please check the network or permissions."    
	$mailBody = "Time: $timestamp`n$msg`nSource: $sourcePath`nDesT: $destUrl"
	Send-UTF8Mail -Subject "$subjectBase - All attempts failed. RetryCount:#$retryCount" -Body $mailBody	
} else {
    Write-Log "Mission Completed!"
}
