# 결재 알림 테이블 사용 가이드

## 📌 알림 발생 시점

### 1. 결재 요청 시 (REQUEST)
```javascript
// 결재 문서 생성 시 → 첫 번째 결재자에게 알림
await createNotification({
  approval_document_id: documentId,
  recipient_user_id: firstApproverId,
  notification_type: 'REQUEST',
  notification_title: 'CT 의뢰 결재 요청',
  notification_message: `${requesterName}님이 ${documentTitle} 결재를 요청했습니다.`,
  action_url: `/approval/document/${documentId}`,
  priority: 'NORMAL'
});
```

### 2. 결재 승인 시 (APPROVED)
```javascript
// 승인 후
// A) 다음 결재자가 있으면 → 다음 결재자에게 알림
if (hasNextApprover) {
  await createNotification({
    recipient_user_id: nextApproverId,
    notification_type: 'REQUEST',
    notification_title: '결재 대기',
    notification_message: `${currentApproverName}님이 승인했습니다. 결재를 진행해주세요.`,
    priority: 'NORMAL'
  });
}

// B) 최종 승인이면 → 요청자에게 완료 알림
if (isFinalApproval) {
  await createNotification({
    recipient_user_id: requesterId,
    notification_type: 'APPROVED',
    notification_title: '결재 승인 완료',
    notification_message: `${documentTitle} 결재가 최종 승인되었습니다.`,
    priority: 'HIGH'
  });
}
```

### 3. 결재 반려 시 (REJECTED)
```javascript
// 반려 시 → 요청자에게 알림
await createNotification({
  recipient_user_id: requesterId,
  notification_type: 'REJECTED',
  notification_title: '결재 반려',
  notification_message: `${approverName}님이 ${documentTitle} 결재를 반려했습니다.\n사유: ${rejectReason}`,
  priority: 'HIGH'
});
```

### 4. 결재 취소 시 (CANCELED)
```javascript
// 취소 시 → 모든 결재선 + 이미 승인한 사람들에게 알림
const notifiedUsers = [
  ...pendingApprovers,
  ...alreadyApprovedUsers
];

for (const userId of notifiedUsers) {
  await createNotification({
    recipient_user_id: userId,
    notification_type: 'CANCELED',
    notification_title: '결재 취소',
    notification_message: `${requesterName}님이 ${documentTitle} 결재를 취소했습니다.`,
    priority: 'NORMAL'
  });
}
```

### 5. 결재선 변경/재배정 시 (MENTIONED)
```javascript
// 새로 추가된 결재자에게 알림
await createNotification({
  recipient_user_id: newApproverId,
  notification_type: 'MENTIONED',
  notification_title: '결재선 변경',
  notification_message: `${documentTitle}의 결재자로 추가되었습니다.`,
  priority: 'HIGH'
});
```

## 🔔 알림 읽음 처리

```javascript
// 알림 클릭 시 읽음 처리
async function markAsRead(notificationId, userId) {
  await db.query(`
    UPDATE approval_notification 
    SET is_read = 1, read_at = NOW() 
    WHERE notification_id = ? AND recipient_user_id = ?
  `, [notificationId, userId]);
}

// 문서 조회 시 관련 알림 모두 읽음 처리
async function markDocumentNotificationsAsRead(documentId, userId) {
  await db.query(`
    UPDATE approval_notification 
    SET is_read = 1, read_at = NOW() 
    WHERE approval_document_id = ? 
      AND recipient_user_id = ? 
      AND is_read = 0
  `, [documentId, userId]);
}
```

## 📧 이메일/푸시 발송 로직

```javascript
async function sendNotificationWithEmail(notification) {
  // 1. 알림 생성
  const notificationId = await createNotification(notification);
  
  // 2. 사용자 알림 설정 확인
  const userSettings = await getUserNotificationSettings(notification.recipient_user_id);
  
  // 3. 이메일 발송 (설정이 켜져있고, 긴급하거나 결재요청인 경우)
  if (userSettings.email_enabled && 
     (notification.priority === 'HIGH' || notification.notification_type === 'REQUEST')) {
    await sendEmail({
      to: userSettings.email,
      subject: notification.notification_title,
      body: notification.notification_message,
      link: notification.action_url
    });
    
    await db.query(`
      UPDATE approval_notification 
      SET is_sent_email = 1, sent_email_at = NOW() 
      WHERE notification_id = ?
    `, [notificationId]);
  }
  
  // 4. 푸시 발송
  if (userSettings.push_enabled) {
    await sendPushNotification({
      userId: notification.recipient_user_id,
      title: notification.notification_title,
      body: notification.notification_message,
      data: { documentId: notification.approval_document_id }
    });
    
    await db.query(`
      UPDATE approval_notification 
      SET is_sent_push = 1, sent_push_at = NOW() 
      WHERE notification_id = ?
    `, [notificationId]);
  }
}
```

## 🗑️ 알림 자동 삭제 (배치 작업)

```javascript
// 매일 자정 실행: 30일 이상 된 읽은 알림 삭제
async function cleanupOldNotifications() {
  await db.query(`
    DELETE FROM approval_notification 
    WHERE is_read = 1 
      AND read_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);
  
  // 90일 이상 된 안읽은 알림도 삭제 (만료)
  await db.query(`
    DELETE FROM approval_notification 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
  `);
}
```

## 📊 알림 조회 쿼리

```sql
-- 사용자의 안읽은 알림 개수
SELECT COUNT(*) as unread_count 
FROM approval_notification 
WHERE recipient_user_id = ? 
  AND is_read = 0;

-- 사용자의 최근 알림 목록 (페이징)
SELECT 
  n.*,
  d.document_title,
  d.document_type,
  u.user_name as sender_name
FROM approval_notification n
LEFT JOIN approval_document d ON n.approval_document_id = d.approval_document_id
LEFT JOIN approval_history h ON n.approval_history_id = h.approval_history_id
LEFT JOIN user u ON h.actor_id = u.user_id
WHERE n.recipient_user_id = ?
ORDER BY n.created_at DESC
LIMIT ? OFFSET ?;

-- 특정 문서의 알림 목록
SELECT * FROM approval_notification 
WHERE approval_document_id = ?
ORDER BY created_at DESC;
```

## ⚙️ 사용자 알림 설정 테이블 (선택사항)

```sql
CREATE TABLE user_notification_settings (
  user_id INT PRIMARY KEY,
  email_enabled TINYINT(1) DEFAULT 1,
  push_enabled TINYINT(1) DEFAULT 1,
  email_on_request TINYINT(1) DEFAULT 1,
  email_on_approved TINYINT(1) DEFAULT 1,
  email_on_rejected TINYINT(1) DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='사용자별 알림 설정';
```

## 🎯 핵심 원칙

1. **중복 방지**: 같은 문서, 같은 수신자, 같은 유형의 알림이 짧은 시간에 여러 개 생성되지 않도록 체크
2. **적시성**: 알림은 이벤트 발생 즉시 생성 (비동기 큐 사용 권장)
3. **개인화**: 수신자에게 필요한 정보만 포함
4. **액션 가능**: 모든 알림은 action_url을 통해 해당 페이지로 바로 이동 가능
5. **자동 정리**: 오래된 알림은 자동 삭제하여 DB 부담 감소
