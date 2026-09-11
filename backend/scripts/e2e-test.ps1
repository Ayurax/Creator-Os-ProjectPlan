$ErrorActionPreference = 'Stop'

function Login($email, $password) {
  $body = @{ email = $email; password = $password } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $body
  return $r.data.token
}

function AuthHeaders($token) {
  return @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
}

function CheckNoSensitive($data, $testName) {
  $json = $data | ConvertTo-Json -Compress
  $sensitive = @("passwordHash", "password", "token", "secret", "apiKey")
  foreach ($s in $sensitive) {
    if ($json -match [regex]::Escape($s)) {
      Write-Host "FAIL: $testName contains '$s'"
      return $false
    }
  }
  Write-Host "PASS: $testName - no sensitive data"
  return $true
}

Write-Host "=== END-TO-END TEST ==="

# 1. Login as brand
Write-Host "`n--- Login brand ---"
$brandToken = Login "brand@example.com" "password123"
$brandHeaders = AuthHeaders $brandToken

# 2. Create campaign
Write-Host "`n--- Create campaign ---"
$campaign = Invoke-RestMethod -Uri "http://localhost:3000/api/campaigns" -Method POST -Headers $brandHeaders -Body '{"name":"E2E Campaign","description":"End-to-end test","budget":25000}'
Write-Host "Campaign ID: $($campaign.data.id)"

# 3. Register creator
Write-Host "`n--- Register creator ---"
$creatorEmail = "e2ecreator_$(Get-Random)@example.com"
$creatorReg = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body ("{`"email`":`"$creatorEmail`",`"password`":`"password123`",`"name`":`"E2E Creator`",`"role`":`"CREATOR`"}")
$creatorToken = Login $creatorEmail "password123"
$creatorHeaders = AuthHeaders $creatorToken

$creatorProfile = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method GET -Headers $creatorHeaders
$creators = Invoke-RestMethod -Uri "http://localhost:3000/api/creators" -Method GET -Headers $creatorHeaders
$myCreator = $creators.data | Where-Object { $_.userId -eq $creatorProfile.data.id }
Write-Host "Creator profile ID: $($myCreator.id)"

# 4. Create collaboration
Write-Host "`n--- Create collaboration ---"
$collab = Invoke-RestMethod -Uri "http://localhost:3000/api/collaborations" -Method POST -Headers $brandHeaders -Body ("{`"campaignId`":$($campaign.data.id),`"creatorId`":$($myCreator.id)}")
Write-Host "Collab ID: $($collab.data.id), Status: $($collab.data.status)"
CheckNoSensitive $collab.data "Collaboration create"

# 5. Creator accepts collaboration
Write-Host "`n--- Accept collaboration ---"
$accept = Invoke-RestMethod -Uri "http://localhost:3000/api/collaborations/$($collab.data.id)/accept" -Method PATCH -Headers $creatorHeaders
Write-Host "Accept status: $($accept.success)"
$collabs = Invoke-RestMethod -Uri "http://localhost:3000/api/collaborations" -Method GET -Headers $creatorHeaders
$myCollab = $collabs.data | Where-Object { $_.id -eq $collab.data.id }
Write-Host "Collab $($collab.data.id) status after accept: $($myCollab.status)"
if ($myCollab.status -ne "ACCEPTED") { Write-Host "FAIL: Collaboration not accepted" } else { Write-Host "PASS: Collaboration accepted" }

# 6. Create contract
Write-Host "`n--- Create contract ---"
$contract = Invoke-RestMethod -Uri "http://localhost:3000/api/contracts" -Method POST -Headers $brandHeaders -Body ("{`"collaborationRequestId`":$($collab.data.id),`"creatorId`":$($myCreator.id),`"terms`":`"Standard terms`"}")
Write-Host "Contract ID: $($contract.data.id)"
CheckNoSensitive $contract.data "Contract create"

# 7. Register freelancer
Write-Host "`n--- Register freelancer ---"
$freelancerEmail = "e2efreelancer_$(Get-Random)@example.com"
$freelancerReg = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body ("{`"email`":`"$freelancerEmail`",`"password`":`"password123`",`"name`":`"E2E Freelancer`",`"role`":`"FREELANCER`"}")
$freelancerToken = Login $freelancerEmail "password123"
$freelancerHeaders = AuthHeaders $freelancerToken

# Get freelancer profile ID by querying the DB via a simple node script
$freelancerProfileId = node "C:\Users\rajsi\Desktop\CreatorOS_Project_Starter\CreatorOS_Project_Plan\backend\scripts\get-fl-id.js" $freelancerEmail
Write-Host "Freelancer profile ID: $freelancerProfileId"

# 8. Create task assigned to freelancer
Write-Host "`n--- Create task ---"
$task = Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" -Method POST -Headers $brandHeaders -Body ("{`"contractId`":$($contract.data.id),`"description`":`"E2E task`",`"dueDate`":`"2026-12-31`",`"assigneeId`":$freelancerProfileId}")
Write-Host "Task ID: $($task.data.id)"

# 9. Submit deliverable as freelancer
Write-Host "`n--- Submit deliverable ---"
$deliv = Invoke-RestMethod -Uri "http://localhost:3000/api/tasks/$($task.data.id)/deliverables" -Method POST -Headers $freelancerHeaders -Body '{"description":"E2E deliverable","mediaUrl":"https://example.com/deliv.mp4"}'
Write-Host "Deliverable submitted"

# 10. Create payment directly via Prisma (no API endpoint)
Write-Host "`n--- Create payment ---"
$paymentId = node "C:\Users\rajsi\Desktop\CreatorOS_Project_Starter\CreatorOS_Project_Plan\backend\scripts\create-payment.js" $($contract.data.id)
Write-Host "Payment ID: $paymentId"

# 11. Mark payment paid
Write-Host "`n--- Mark payment paid ---"
$paid = Invoke-RestMethod -Uri "http://localhost:3000/api/payments/$paymentId/pay" -Method POST -Headers $brandHeaders
Write-Host "Mark paid status: $($paid.success)"

# 12. Create review
Write-Host "`n--- Create review ---"
$review = Invoke-RestMethod -Uri "http://localhost:3000/api/reviews" -Method POST -Headers $brandHeaders -Body ("{`"campaignId`":$($campaign.data.id),`"creatorId`":$($myCreator.id),`"rating`":5,`"comment`":`"Great E2E`"}")
Write-Host "Review ID: $($review.data.id)"

# 13. Password hash audit
Write-Host "`n--- Password hash audit ---"
$endpoints = @(
  @{ url = "http://localhost:3000/api/creators"; method = "GET"; headers = $creatorHeaders; name = "GET /api/creators" },
  @{ url = "http://localhost:3000/api/creators/$($myCreator.id)"; method = "GET"; headers = $creatorHeaders; name = "GET /api/creators/:id" },
  @{ url = "http://localhost:3000/api/campaigns"; method = "GET"; headers = $brandHeaders; name = "GET /api/campaigns" },
  @{ url = "http://localhost:3000/api/campaigns/$($campaign.data.id)"; method = "GET"; headers = $brandHeaders; name = "GET /api/campaigns/:id" },
  @{ url = "http://localhost:3000/api/collaborations"; method = "GET"; headers = $creatorHeaders; name = "GET /api/collaborations" },
  @{ url = "http://localhost:3000/api/contracts"; method = "GET"; headers = $brandHeaders; name = "GET /api/contracts" },
  @{ url = "http://localhost:3000/api/tasks"; method = "GET"; headers = $brandHeaders; name = "GET /api/tasks" },
  @{ url = "http://localhost:3000/api/payments"; method = "GET"; headers = $brandHeaders; name = "GET /api/payments" },
  @{ url = "http://localhost:3000/api/reviews"; method = "GET"; headers = $brandHeaders; name = "GET /api/reviews" },
  @{ url = "http://localhost:3000/api/messages"; method = "GET"; headers = $creatorHeaders; name = "GET /api/messages" },
  @{ url = "http://localhost:3000/api/users/me"; method = "GET"; headers = $creatorHeaders; name = "GET /api/users/me" }
)

$allPass = $true
foreach ($ep in $endpoints) {
  $r = Invoke-RestMethod -Uri $ep.url -Method $ep.method -Headers $ep.headers
  if (-not (CheckNoSensitive $r $ep.name)) { $allPass = $false }
}

if ($allPass) { Write-Host "`nPASS: All endpoints clean" } else { Write-Host "`nFAIL: Some endpoints leak data" }

# 14. Test error cases
Write-Host "`n--- Error cases ---"
$badToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJDRVJUT1IiLCJpYXQiOjE3ODk2NzI5Mzh9.invalid"
$badHeaders = AuthHeaders $badToken
try {
  Invoke-RestMethod -Uri "http://localhost:3000/api/collaborations/99999/accept" -Method PATCH -Headers $badHeaders
  Write-Host "FAIL: Should have rejected invalid token"
} catch {
  Write-Host "PASS: Invalid token rejected"
}

try {
  Invoke-RestMethod -Uri "http://localhost:3000/api/collaborations/99999/accept" -Method PATCH -Headers $creatorHeaders
  Write-Host "FAIL: Should have rejected nonexistent collab"
} catch {
  Write-Host "PASS: Nonexistent collab rejected"
}

# Creator trying to accept someone else's collaboration
$otherCollabs = Invoke-RestMethod -Uri "http://localhost:3000/api/collaborations" -Method GET -Headers $brandHeaders
$otherCollab = $otherCollabs.data | Where-Object { $_.creatorId -ne $myCreator.id } | Select-Object -First 1
if ($otherCollab) {
  try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/collaborations/$($otherCollab.id)/accept" -Method PATCH -Headers $creatorHeaders
    Write-Host "FAIL: Creator should not accept another creator's collab"
  } catch {
    Write-Host "PASS: Creator cannot accept another creator's collab"
  }
}

Write-Host "`n=== TEST COMPLETE ==="
