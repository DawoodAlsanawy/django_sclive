<!DOCTYPE html>
<html>
<?php 
/**
 * PHPMailer RFC821 SMTP email transport class.
 * PHP Version 5.5.
 *
 * @see       https://github.com/PHPMailer/PHPMailer/ The PHPMailer GitHub project
 *
 * @author    Marcus Bointon (Synchro/coolbru) <phpmailer@synchromedia.co.uk>
 * @author    Jim Jagielski (jimjag) <jimjag@gmail.com>
 * @author    Andy Prevost (codeworxtech) <codeworxtech@users.sourceforge.net>
 * @author    Brent R. Matzelle (original founder)
 * @copyright 2012 - 2020 Marcus Bointon
 * @copyright 2010 - 2012 Jim Jagielski
 * @copyright 2004 - 2009 Andy Prevost
 * @license   http://www.gnu.org/copyleft/lesser.html GNU Lesser General Public License
 * @note      This program is distributed in the hope that it will be useful - WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.
 */

?>
<head>
    <?php
    session_start();
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    if (!empty($_GET['logout']))
        session_unset();
    ?>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>Execuses Systems</title>

    <!-- Custom fonts for this template -->
    <link href="../admin/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="../admin/css/sb-admin-2.min.css" rel="stylesheet">

    <!-- Custom styles for this page -->
    <link href="../admin/vendor/datatables/dataTables.bootstrap4.min.css" rel="stylesheet">
    <link href="../admin/css/main.css" rel="stylesheet">

    <?php include("../../connection.php"); ?>
    <?php
    include("../../controllers/getDataAdmin.php");
    ?>
    <?php
    include("../../models/admin/medical_centers.php");
    $medical_center = new MedicalCenters();
    include("../../controllers/admin/medical_centers.php");
    function getHeaders($table)
    {
        if ($table == "seeker_reports") {
            return "<tr>
                <th>ID</th>
                <th>Report Name (EN)</th>
                <th>Report Name (AR)</th>
                <th>ID Number</th>
                <th>Nationality (EN)</th>
                <th>Nationality (AR)</th>
                <th>Job Center</th>
                <th>Doctor Name (EN)</th>
                <th>Doctor Name (AR)</th>
                <th>Job Name (EN)</th>
                <th>Job Name (AR)</th>
                <th>In Date</th>
                <th>Out Date</th>
            </tr>";
        } else if ($table == "users") {
            return "<tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Authorized</th>
                <th>Address</th>
                <th>Type</th>
                <th>Services Num</th>
                <th>Image</th>
                <th>Notes</th>
                <th>Date</th>
            </tr>";
        } else if ($table == "permissions") {
            return "<tr>
                <th>ID</th>
                <th>User</th>
                <th>Permission Name</th>
                <th>Add</th>
                <th>Display</th>
                <th>Edit</th>
                <th>Delete</th>
                <th>Date</th>
            </tr>";
        } else if ($table == "medical_centers") {
            return "
    <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Name Arabic</th>
                <th>Icon</th>
                <th>Date</th>
            </tr>";
        }
    }
    ?>
</head>

<body id="page-top"  dir="rtl">

    <!-- Page Wrapper -->
    <div id="wrapper">

        <!-- Content Wrapper -->
        <div id="content-wrapper" class="d-flex flex-column">

            <!-- Main Content -->
            <div id="content">
                <?php if (!empty($_GET['isAllowed']) && !empty($_GET['table'])) {
                    if ($_GET['isAllowed'] == "runScript") { ?>
                        <!-- Topbar -->
                        <?php include("../../parts/header.php"); ?>
                        <div class="container-fluid">
                            <p class="mb-4 h3 text-white bg-primary p-2 text-center rounded">Manage all <?php echo $table; ?></p>
                            <div class="card shadow mb-4">
                                <div class="card-body">
                                    <div class="table-responsive small">
                                        <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                                            <thead class="bg-primary text-white text-center font-weight-bold">
                                                <?php echo getHeaders($table); ?>
                                            </thead>
                                            <tfoot>
                                                <?php echo getHeaders($table); ?>
                                            </tfoot>
                                            <tbody>
                                                <?php if (!empty($data)) {
                                                    if ($table == "seeker_reports") { ?>
                                                        <?php
                                                        foreach ($data as $report) {
                                                        ?>
                                                            <tr>
                                                                <td><?php echo $report->seeker_report_id; ?></td>
                                                                <td><?php echo $report->seeker_report_name; ?></td>
                                                                <td><?php echo $report->seeker_report_name_ar; ?></td>
                                                                <td><?php echo $report->seeker_report_id_number; ?></td>
                                                                <td><?php echo $report->seeker_report_nationality; ?></td>
                                                                <td><?php echo $report->seeker_report_nationality_ar; ?></td>
                                                                <td><?php echo $report->seeker_report_job_center; ?></td>
                                                                <td><?php echo $report->seeker_report_dr_name; ?></td>
                                                                <td><?php echo $report->seeker_report_dr_name_ar; ?></td>
                                                                <td><?php echo $report->seeker_report_job_name; ?></td>
                                                                <td><?php echo $report->seeker_report_job_name_ar; ?></td>
                                                                <td><?php echo $report->seeker_report_in_date; ?></td>
                                                                <td><?php echo $report->seeker_report_out_date; ?></td>
                                                            </tr>
                                                        <?php }
                                                    } else if ($table == "users") {
                                                        foreach ($data as $user) {
                                                        ?>
                                                            <tr>
                                                                <td><?php echo $user->user_id; ?></td>
                                                                <td><?php echo $user->user_name; ?></td>
                                                                <td><?php echo $user->user_email; ?></td>
                                                                <td><?php echo $user->user_age; ?></td>
                                                                <td><?php echo $user->user_authorized; ?></td>
                                                                <td><?php echo $user->user_address; ?></td>
                                                                <td><?php echo $user->user_type; ?></td>
                                                                <td><?php echo $user->user_request_num; ?></td>
                                                                <td><?php if (!empty($user->user_image) && file_exists('../Images/Accounts/' . $user->user_image)) { ?><img class="avatar-img rounded-circle" src="../Images/Accounts/<?php echo $user->user_image; ?>" alt="<?php echo $Image; ?>" width="75" height="75" /><?php } ?></td>
                                                                <td><?php echo $user->user_notes; ?></td>
                                                                <td><?php echo $user->user_date; ?></td>
                                                            </tr>
                                                        <?php }
                                                    } else if ($table == "permissions") { ?>
                                                        <?php foreach ($data as $permission) { ?>
                                                            <tr>
                                                                <td><?php echo $permission->permission_id; ?></td>
                                                                <td><?php echo $permission->permission_user_id; ?></td>
                                                                <td><?php echo $permission->permission_name; ?></td>
                                                                <td>
                                                                    <input type="checkbox" <?php echo ($permission->permission_display ?? 0) == 1 ? 'checked' : ''; ?> disabled>
                                                                </td>
                                                                <td>
                                                                    <input type="checkbox" <?php echo ($permission->permission_add ?? 0) == 1 ? 'checked' : ''; ?> disabled>
                                                                </td>
                                                                <td>
                                                                    <input type="checkbox" <?php echo ($permission->permission_edit ?? 0) == 1 ? 'checked' : ''; ?> disabled>
                                                                </td>
                                                                <td>
                                                                    <input type="checkbox" <?php echo ($permission->permission_delete ?? 0) == 1 ? 'checked' : ''; ?> disabled>
                                                                </td>
                                                                <td><?php echo $permission->permission_created_at; ?></td>
                                                            </tr>
                                                        <?php } ?>
                                                        <?php } else if ($table == "medical_centers") {
                                                        foreach ($data as $medical_center) {
                                                        ?>
                                                            <tr>
                                                                <td><?php echo $medical_center->medical_center_id; ?></td>
                                                                <td><?php echo $medical_center->medical_center_name; ?></td>
                                                                <td><?php echo $medical_center->medical_center_name_ar; ?></td>
                                                                <td><?php if (!empty($medical_center->medical_center_icon) && file_exists('../Images/MedicalCenters/' . $medical_center->medical_center_icon)) { ?><img class="avatar-img rounded-circle" src="../Images/MedicalCenters/<?php echo $medical_center->medical_center_icon; ?>" alt="<?php echo $Image; ?>" width="75" height="75" /><?php } ?></td>
                                                                <td><?php echo $medical_center->medical_center_created_at; ?></td>
                                                            </tr>
                                                <?php }
                                                    }
                                                } ?>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
            </div>

            <footer class="sticky-footer bg-white">
                <?php include("../../parts/footer.php"); ?>
            </footer>
            <!-- End of Footer -->
        <?php } } ?>
        </div>
        <!-- End of Content Wrapper -->

    </div>
    <!-- End of Page Wrapper -->

    <?php include("../../parts/js.php"); ?>
</body>

</html>