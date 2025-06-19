# API Endpoints Summary

This document summarizes all the API endpoints available in the Stationery Management System backend.

## New Endpoints Added

### 1. ProductController (`/api/products`)
**New endpoints added:**
- `GET /api/products/category/{categoryId}` - Get products by category

### 2. OrderController (`/api/orders`)
**New endpoints added:**
- `GET /api/orders/department/{departmentId}` - Get orders by department (Admin only)
- `GET /api/orders/department/{departmentId}/latest` - Get latest order by department (Admin only)

### 3. DashboardController (`/api/dashboard`) - **NEW CONTROLLER**
**Comprehensive dashboard endpoints for admin analytics:**

#### Overview
- `GET /api/dashboard/overview` - Get complete dashboard overview with all stats

#### Department Stats
- `GET /api/dashboard/departments/stats` - Get department statistics
- `GET /api/dashboard/departments/pending-orders` - Get departments with pending orders

#### Order Stats
- `GET /api/dashboard/orders/current-month` - Get current month order statistics
- `GET /api/dashboard/orders/monthly-summary?months=12` - Get monthly order summary
- `GET /api/dashboard/orders/status-distribution` - Get order status distribution
- `GET /api/dashboard/orders/submission-timeline` - Get order submission timeline
- `GET /api/dashboard/orders/completion-rate` - Get order completion rate
- `GET /api/dashboard/orders/document-upload-success` - Get document upload success rate

#### Product Stats
- `GET /api/dashboard/products/stats` - Get product statistics
- `GET /api/dashboard/products/top-ordered?limit=10` - Get top ordered products
- `GET /api/dashboard/products/category-distribution` - Get product category distribution

#### Workflow Stats
- `GET /api/dashboard/workflow/stats` - Get admin workflow statistics

#### Quick Stats & Charts
- `GET /api/dashboard/quick-stats` - Get quick statistics for dashboard cards
- `GET /api/dashboard/charts/orders-by-status` - Get orders by status chart data
- `GET /api/dashboard/charts/products-by-category` - Get products by category chart data
- `GET /api/dashboard/charts/monthly-orders?months=6` - Get monthly orders chart data

### 4. CategoryController (`/api/categories`)
**New endpoints added:**
- `GET /api/categories/{id}` - Get category by ID

### 5. DepartmentController (`/api/departments`)
**New endpoints added:**
- `GET /api/departments/{id}` - Get department by ID (Admin only)
- `POST /api/departments` - Create new department (Admin only)
- `PUT /api/departments/{id}` - Update department (Admin only)
- `DELETE /api/departments/{id}` - Delete department (Admin only)

### 6. UnitController (`/api/units`)
**New endpoints added:**
- `GET /api/units/{id}` - Get unit by ID (Admin only)

### 7. NotificationController (`/api/notifications`)
**New endpoints added:**
- `GET /api/notifications/unread-count` - Get count of unread notifications
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read

## Complete API Endpoints List

### Authentication (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users (`/api/users`)
- `GET /api/users/me` - Get current user info
- Dashboard stats endpoints (moved to DashboardController for better organization)

### Admin Users (`/api/admin/users`)
- `GET /api/admin/users` - Get all users (Admin only)
- `POST /api/admin/users` - Create user (Admin only)
- `PUT /api/admin/users/{id}` - Update user (Admin only)
- `DELETE /api/admin/users/{id}` - Delete user (Admin only)

### Products (`/api/products`)
- `GET /api/products/all` - Get all products (simple list)
- `GET /api/products` - Get products with pagination and optional category filter
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{categoryId}` - Get products by category
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/{id}` - Update product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)
- `POST /api/products/{id}/image` - Upload product image (Admin only)

### Categories (`/api/categories`)
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/{id}` - Update category (Admin only)
- `DELETE /api/categories/{id}` - Delete category (Admin only)
- `POST /api/categories/{id}/icon` - Upload category icon (Admin only)

### Departments (`/api/departments`)
- `GET /api/departments` - Get all departments (Admin only)
- `GET /api/departments/{id}` - Get department by ID (Admin only)
- `POST /api/departments` - Create department (Admin only)
- `PUT /api/departments/{id}` - Update department (Admin only)
- `DELETE /api/departments/{id}` - Delete department (Admin only)

### Units (`/api/units`)
- `GET /api/units` - Get all units (Admin only)
- `GET /api/units/{id}` - Get unit by ID (Admin only)
- `POST /api/units` - Create unit (Admin only)
- `PUT /api/units/{id}` - Update unit (Admin only)
- `DELETE /api/units/{id}` - Delete unit (Admin only)

### Orders (`/api/orders`)
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/mine` - Get current user's orders
- `GET /api/orders/{id}/items` - Get order items
- `GET /api/orders/department/{departmentId}` - Get orders by department (Admin only)
- `GET /api/orders/department/{departmentId}/latest` - Get latest order by department (Admin only)
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/comment` - Update order comment (Admin only)
- `PUT /api/orders/{id}/approve` - Approve order (Admin only)
- `PUT /api/orders/{id}/reject` - Reject order (Admin only)
- `POST /api/orders/{id}/export` - Export order to PDF
- `PUT /api/orders/{id}/submit-signed` - Submit signed PDF
- `GET /api/orders/{id}/signed-file` - Download signed PDF
- `POST /api/orders/order-window/toggle` - Toggle order window (Admin only)
- `GET /api/orders/order-window/status` - Get order window status
- `GET /api/orders/check-period` - Check if ordering is allowed
- `GET /api/orders/pending` - Get pending orders
- `GET /api/orders/submitted` - Get submitted orders (Admin only)
- `GET /api/orders/pending-count` - Get pending orders count
- `GET /api/orders/monthly-count` - Get monthly orders count
- `GET /api/orders/latest` - Get latest order for current user's department
- `GET /api/orders/reports/products` - Get top ordered products report (Admin only)
- `GET /api/orders/reports` - Get orders report by month/year (Admin only)

### Order Summaries (`/api/summaries`)
- `GET /api/summaries` - Get order summaries with filters
- `GET /api/summaries/dynamic` - Get dynamic order summaries
- `POST /api/summaries/run` - Run summary aggregation (Admin only)

### Reports (`/api/reports`)
- `GET /api/reports` - Get monthly report summary (Admin only)
- `GET /api/reports/full` - Get full monthly report (Admin only)
- `GET /api/reports/export/excel` - Export report to Excel (Admin only)
- `GET /api/reports/export/pdf` - Export report to PDF (Admin only)

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/unread-count` - Get unread notifications count
- `POST /api/notifications/announce` - Send announcement (Admin only)
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read

### Dashboard (`/api/dashboard`) - **NEW**
- Complete dashboard analytics endpoints (see detailed list above)

## Security Notes

- All endpoints marked with "(Admin only)" require `ADMIN` role
- Other endpoints require authentication but are accessible to all authenticated users
- Dashboard endpoints are restricted to admin users only
- File upload endpoints have size and type restrictions

## Response Formats

All endpoints return JSON responses with appropriate HTTP status codes:
- `200 OK` - Successful operation
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Usage Examples

### Get Dashboard Overview
```http
GET /api/dashboard/overview
Authorization: Bearer <token>
```

### Get Products by Category
```http
GET /api/products/category/1
```

### Create New Department
```http
POST /api/departments
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "IT Department",
  "email": "it@company.com"
}
```

### Get Top Ordered Products
```http
GET /api/dashboard/products/top-ordered?limit=5
Authorization: Bearer <admin-token>
```