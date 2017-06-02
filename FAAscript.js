/*Script for ASL standard project list
Made by Roger Jönsson*/

(function () {

    // Create object that have the context information about the field that we want to change it's output render 
    var contextvalue = {};
    contextvalue.Templates = {};
    contextvalue.Templates.Fields = {
        // Apply the new rendering for field on List View
        "Days_x0020_to_x0020_FAA": {
            "View": FAACalculate
        },
        "Latest_x0020_FAA_x0020_Date": {
            "View": LatestFAAReliable
        },
        "Mech_x0020_FAA_x0020_complete": {
            "View": priorityFiledTemplate
        },
        "Dimension_x0020_report": {
            "View": priorityFiledTemplate
        },
        "Material_x0020_declaration_x0020": {
            "View": priorityFiledTemplate
        },
        "Cosmetics": {
            "View": priorityFiledTemplate
        },
        "Cmk_x0020_Analysis": {
            "View": priorityFiledTemplate
        },
        "Control_x0020_Plan": {
            "View": priorityFiledTemplate,
            "View": MechCompleteTest
        },
        "FAA_x0020_Approval_x0020_Date": {
            "View": priorityFiledTemplate,
            "View": FAA_Approval_Coloring
        },
        "UL_x0020_Declaration": {
            "View": priorityFiledTemplate
        },
        "FAA_x0020_Status": {
            "View": priorityFiledTemplate
        },
        "Status": {
            "View": statusCheck
        },
        "Unit_x0020_price_x0020__x0028_US": {
            "View": calculateValueOfCurrency
        }
    };
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(contextvalue);


})();


function FAA_Approval_Coloring(ctx) {
    var item = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];

    if (item != "") {
        return "<div class='ASL'><img src='/suppliers/Manufacturing/images/check_green.png' alt='Approved' title='Approved' align='center'/>&nbsp" + item + "</div>";
    }
}

function LatestFAAReliable(ctx) {
    var item = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];
    var DeliveryLT = ctx.CurrentItem.Delivery_x0020_Leadtime_x0020__x;
    var ProductionLT = ctx.CurrentItem.Production_x0020_Leadtime;
    var FASDate = ctx.CurrentItem.FAS_x0020_Date;

    if (DeliveryLT == "" || ProductionLT == "" || FASDate == "") {
        return "<div class='FAA_red' title='UNRELIABLE  Values are missing'>" + item + "</div>";
    } else {
        return item;
    }

}

function MechCompleteTest(ctx) {
    var priority = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];
    var MechComplete = ctx.CurrentItem.Mech_x0020_FAA_x0020_complete;

    // Return html element with appropriate color based on priority value
    if (priority == "Not Approved" && MechComplete == "Yes") {
        return "<div class='ASL status-warning'><img src='/suppliers/Manufacturing/images/cross_red.png' alt='Not Approved' title='Not Approved'/></div>";
    } else
    if (priority == "Not Approved") {
        return "<div class='ASL'><img src='/suppliers/Manufacturing/images/cross_red.png' alt='Not Approved' title='Not Approved'/></div>";
    } else
    if (priority == "Approved") {
        return "<div class='ASL'><img src='/suppliers/Manufacturing/images/check_green.png' alt='Approved' title='Approved' align='center'/></div>";
    } else
    if (priority == "Not Needed") {
        return "<div class='ASL'><img src='/suppliers/Manufacturing/images/grey_asl.png' alt='Not Needed' title='Not Needed' align='center'/></div>";
    }
}

function FAACalculate(ctx) {
    var priority = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];
    var approvedDateContent = ctx.CurrentItem.FAA_x0020_Approval_x0020_Date;
    var latestFAADate = ctx.CurrentItem.Latest_x0020_FAA_x0020_Date;

    //Calculate todays date
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }
    today = yyyy + '-' + mm + '-' + dd;

    var Today = new Date(today);
    var Latest = new Date(latestFAADate);
    var diff = new Date(Latest - Today);

    var dateToFAA = diff / 1000 / 60 / 60 / 24;

    if (approvedDateContent != "") {
        return "<div class='FAA_complete'></div>";
    }
    switch (true) {
        case (dateToFAA < 0):
            return "<div class='FAA_purple'>" + dateToFAA + "</div>";
        case (dateToFAA <= 7 && dateToFAA >= 0):
            return "<div class='FAA_red'>" + dateToFAA + "</div>";
        case (dateToFAA <= 14 && dateToFAA > 7):
            return "<div class='FAA_orange'>" + dateToFAA + "</div>";
        case (dateToFAA > 14):
            return "<div class='FAA_green'>" + dateToFAA + "</div>";
        default:
            return dateToFAA;
    }
}

function statusCheck(ctx) {
    var item = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];

    var FAA_filledIn = ctx.CurrentItem["FAA_x0020_Approval_x0020_Date"];

    if (FAA_filledIn === undefined) {
        return item;
    }

    if (FAA_filledIn == "") {
        if (item == "Released") {
            return "<div class='status-error' title='Item has no FAA yet'>" + item + "</div>";
        } else {
            return item;
        }
    }
    if (FAA_filledIn != "" && item != "Released") {
        return "<div class='status-warning' title='Set Status to Released. It has a FAA'>" + item + "</div>";
    }
    if (FAA_filledIn != "" && item == "Released") {
        return item;
    }
}



function priorityFiledTemplate(ctx) {

    var priority = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];

    // Return html element with appropriate color based on priority value
    switch (priority) {
        case "Not Approved":
        case "No":
            return "<div class='ASL'><img src='/suppliers/Manufacturing/images/cross_red.png' alt='Not Approved' title='Not Approved'/></div>";
        case "Approved":
        case "Yes":
            return "<div class='ASL'><img src='/suppliers/Manufacturing/images/check_green.png' alt='Approved' title='Approved' align='center'/></div>";
        case "Not Needed":
            return "<div class='ASL'><img src='/suppliers/Manufacturing/images/grey_asl.png' alt='Not Needed' title='Not Needed' align='center'/></div>";
        case "Approved with Deviation":
            return "<div class='ASL'><img src='/suppliers/Manufacturing/images/yellow_asl.png' alt='Approved with deviation' title='Approved with deviation' align='center'/></div>";
        default:
            return priority;
    }
}

function calculateValueOfCurrency(ctx) {

    var currencyValue = ctx.CurrentItem["Currency_x003a_Value"];
    var unitPrice = ctx.CurrentItem["Unit_x0020_Price0."];
    var convertedCurrencyValue = currencyValue.replace(",", ".");

    //Calculate value of USD
    var result = unitPrice * convertedCurrencyValue;

    return result.toFixed(2);

}

//JQuery that centers the icons and doing CSS
jQuery(document).ready(function () {
    var CSSLink = "<link rel='stylesheet' type='text/css' href='/portfolios/NewVideoProducts/HedwigM31/SiteAssets/ASL_CSS.css'>"
    var StickyHeaders = "<script type='text/javascript' src='/portfolios/NewVideoProducts/HedwigM31/SiteAssets/StickyHeaders.js'></script>"
    jQuery(CSSLink).appendTo("head");
    jQuery(StickyHeaders).appendTo("head");
    jQuery("th").css("font-weight", "bold");

    //Creating customized header colors based on attribute displayname
    var mechanicsheaders = [
        "Logo",
        "Supplier",
        "Part Number",
        "Part Name",
        "Supplier",
        "Status",
        "Cosmetics",
        "Measurement Report",
        "Mech FAA complete",
        "Capability Studies",
        "Component type",
        "New Part",
        "Part Overview Link",
        "Critical Component",
        "Critical Comp Description",
        "Material declaration",
        "UL declaration",
        "Major changes since Quote",
        "Parent Assembly"
    ]

    var ilheaders = [
        "Delivery Leadtime (Days)",
        "Production Leadtime (Days)",
        "FAS Date",
        "Material Leadtime (Days)",
        "FAS qty",
        "Pre-Series qty"
    ]

    var qeheaders = [
        "Control Plan",
        "FAA Approval Date"
    ]

    var sourcingheaders = [
        "Quote Link",
        "Sourcing status",
        "Purchaser",
        "Quote Date",
        "Tool lead time (days)",
        "Tool cost (USD)",
        "Material Leadtime",
        "Sample deliver date",
        "Purchase Order",
        "Tool Ordered",
        "Tooling No",
        "Tool life time (shots)",
        "Cavities in tool",
        "Unit Price",
        "Currency",
        "MOQ",
        "Unit price (USD)",
        "Sample lead time (days)",
        "Other cost"
    ]



    for (var i = 0; i < mechanicsheaders.length; i++) {
        var selector = "[displayname='" + mechanicsheaders[i] + "']";
        jQuery(selector).parent().addClass("Mechanics-header");
    }

    for (var i = 0; i < ilheaders.length; i++) {
        var selector = "[displayname='" + ilheaders[i] + "']";
        jQuery(selector).parent().addClass("IL-header");
    }

    for (var i = 0; i < qeheaders.length; i++) {
        var selector = "[displayname='" + qeheaders[i] + "']";
        jQuery(selector).parent().addClass("QE-header");
    }

    for (var i = 0; i < sourcingheaders.length; i++) {
        var selector = "[displayname='" + sourcingheaders[i] + "']";
        jQuery(selector).parent().addClass("Sourcing-header");

    }

});