
$azcopyPath = "xxxx"
$sourcePath = "xxxx"
$destUrl = "xxxx"
$capMbps = 110


$logFile = "azcopy_log_$(Get-Date -Format 'yyyyMMdd').txt"
$logPath = Join-Path -Path $PSScriptRoot -ChildPath $logFile


$smtpServer = "xxxx"
$smtpPort = xxxx
$smtpUser = "xxxx"
$smtpPassword = "xxxx"
$from = "xxxx"
$to = ""xxxx"
$subjectBase = "AzCopy Notification"


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
        Write-Log "Send email：$Subject"
    } catch {
        Write-Log "Failed to send email：$($_.Exception.Message)"
    }
}


$timestamp = Get-Date -Format "yyyyMMdd HH:mm:ss"
Write-Log "[Start] AzCopy Uploading..."

try {
    & "$azcopyPath" copy "$sourcePath" "$destUrl" --recursive --cap-mbps=$capMbps

    if ($LASTEXITCODE -eq 0) {
        Write-Log "[Success] AzCopy upload completed."
    } else {
        $msg = "AzCopy execution failed with exit code：$LASTEXITCODE"
        Write-Log $msg

        $mailBody = "Time: $timestamp`n$msg`nSource: $sourcePath`nDesT: $destUrl"
        Send-UTF8Mail -Subject "$subjectBase" -Body $mailBody
    }
} catch {
    $msg = "AzCopy failed：$($_.Exception.Message)"
    Write-Log $msg

    $mailBody = "Time: $timestamp`n$msg`nSource: $sourcePath`nDesT: $destUrl"
    Send-UTF8Mail -Subject "$subjectBase - Failed" -Body $mailBody
}
