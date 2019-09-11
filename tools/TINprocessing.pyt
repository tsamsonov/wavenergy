import os, sys
import arcpy

from TINcontours import tin_contours

class Toolbox(object):
    def __init__(self):
        """Define the toolbox (the name of the toolbox is the name of the
        .pyt file)."""
        self.label = "TIN Processing Toolbox"
        self.alias = ""

        # List of tool classes associated with this toolbox
        self.tools = [GetTINContours]

class GetTINContours(object):

    def __init__(self):
        """Define the tool (tool name is the name of the class)."""
        self.label = "TIN Contours"
        self.description = ""
        self.canRunInBackground = True

    def getParameterInfo(self):

        in_points = arcpy.Parameter(
            displayName="Input points feature layer",
            name="in_points",
            datatype="GPFeatureLayer",
            parameterType="Required",
            direction="Input")
        in_points.filter.list = ["Point"]

        in_field = arcpy.Parameter(
            displayName="Z value field",
            name="in_field",
            datatype="GPString",
            parameterType="Required",
            direction="Input")
        in_field.parameterDependencies = [in_points.name]

        contour_interval = arcpy.Parameter(
            displayName="Contour interval",
            name="contour_interval",
            datatype="GPDouble",
            parameterType="Required",
            direction="Input")

        contour_interval.filter.type = "Range"
        contour_interval.filter.list = [sys.float_info.min, sys.float_info.max]

        base_contour = arcpy.Parameter(
            displayName="Base contour level",
            name="base_contour",
            datatype="GPDouble",
            parameterType="Required",
            direction="Input")
        base_contour.value = 0.0

        index_step = arcpy.Parameter(
            displayName="Index contour step (each)",
            name="index_step",
            datatype="GPLong",
            parameterType="Required",
            direction="Input")
        base_contour.value = 5

        clip_features = arcpy.Parameter(
            displayName="Clipping polygons (optional)",
            name="clip_features",
            datatype="GPFeatureLayer",
            parameterType="Optional",
            direction="Input")
        clip_features.filter.list = ["Polygon"]

        out_contours = arcpy.Parameter(
            displayName="Output contours feature class",
            name="out_features",
            datatype="DEFeatureClass",
            parameterType="Required",
            direction="Output")

        out_bands = arcpy.Parameter(
            displayName="Output isobands feature class (optional)",
            name="out_bands",
            datatype="DEFeatureClass",
            parameterType="Optional",
            direction="Output")


        params = [in_points, in_field, contour_interval, base_contour, index_step, clip_features, out_contours, out_bands]
        return params

    def isLicensed(self):
        return True

    def updateParameters(self, parameters):

        if parameters[0].altered:
            fields = arcpy.ListFields(parameters[0].value)
            num_fields = []
            for field in fields:
                if field.type == "Double":
                    num_fields.append(field.name)

            parameters[1].filter.type = "ValueList"
            parameters[1].filter.list = num_fields

        return

    def updateMessages(self, parameters):
        return

    def execute(self, parameters, messages):

        in_points = parameters[0].valueAsText
        in_field = parameters[1].valueAsText.split('.')[-1]
        contour_interval = float(parameters[2].valueAsText)
        base_contour = float(parameters[3].valueAsText)
        index_step = int(parameters[4].valueAsText)
        clip_features = parameters[5].valueAsText
        out_contours = parameters[6].valueAsText
        out_bands = parameters[7].valueAsText

        # os.system('TINcontours.py "{0}" "{1}" "{2}" "{3}" "{4}" "{5}" "{6}"'.format(in_points, in_field, contour_interval, base_contour, clip_features, out_contours, out_bands))

        tin_contours(in_points, in_field, contour_interval, base_contour, index_step, clip_features, out_contours, out_bands)

        return